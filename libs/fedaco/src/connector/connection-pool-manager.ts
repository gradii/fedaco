/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { DriverConnection, DriverConnectionResolver } from './driver-connection';

/**
 * Configuration options for connection pooling.
 */
export interface ConnectionPoolConfig {
  /* Minimum number of connections to maintain in the pool */
  min?: number;
  /* Maximum number of connections allowed in the pool */
  max?: number;
  /* Maximum time (ms) to wait for an available connection */
  acquireTimeout?: number;
  /* Time (ms) before an idle connection is closed */
  idleTimeout?: number;
}

/**
 * Interface for managing a pool of database connections.
 *
 * Implementations should handle connection lifecycle, including
 * acquisition, release, and cleanup.
 */
export interface ConnectionPoolManager {
  /**
   * Acquire a connection from the pool.
   *
   * @throws Error if pool is exhausted and acquireTimeout is exceeded
   */
  acquire(): Promise<DriverConnection>;

  /**
   * Release a connection back to the pool.
   *
   * @param connection The connection to release
   */
  release(connection: DriverConnection): Promise<void>;

  /**
   * Discard a broken/dead connection instead of releasing it back
   * into the pool. The connection is disconnected and pool capacity
   * is freed for a new connection.
   *
   * @param connection The connection to discard
   */
  discard(connection: DriverConnection): Promise<void>;

  /**
   * Destroy the pool and close all connections.
   */
  destroy(): Promise<void>;

  /**
   * Get current pool statistics.
   *
   * @returns Object containing total, idle, active, and pending connection counts
   */
  getPoolSize(): { total: number; idle: number; active: number; pending: number };
}

/**
 * Default driver-agnostic pool. The pool itself holds no driver-specific
 * knowledge — it asks the supplied {@link DriverConnectionResolver} for new
 * `DriverConnection` instances, and disconnects them via the connection's own
 * `disconnect()` method when they expire.
 *
 * Semantics:
 *   - `acquire()` reuses an idle connection when available; otherwise opens a
 *     new one up to `max`; otherwise queues the caller until a connection is
 *     released or `acquireTimeout` elapses.
 *   - `release()` hands the connection straight to the longest-waiting
 *     queued caller, otherwise parks it in the idle list with an
 *     `idleTimeout` after which the connection is closed.
 *   - `discard()` removes a broken connection from the pool and frees
 *     capacity so that queued waiters can be serviced.
 *   - `destroy()` rejects pending waiters and closes every connection
 *     (idle + active).
 *
 * Idle/acquire timeouts default to 30s. `unref`-ing the timers prevents the
 * pool from keeping the event loop alive on its own.
 */
export class DefaultConnectionPoolManager implements ConnectionPoolManager {
  private idle: DriverConnection[] = [];
  private active: Set<DriverConnection> = new Set();

  // Track connections currently being resolved to prevent exceeding `max`
  // during concurrent `acquire()` calls.
  private pendingCreations = 0;

  private waiters: Array<{
    resolve: (c: DriverConnection) => void;
    reject : (e: Error) => void;
    timer  : ReturnType<typeof setTimeout>;
  }> = [];

  private idleTimers: Map<DriverConnection, ReturnType<typeof setTimeout>> = new Map();
  private destroyed = false;

  private readonly max: number;
  private readonly min: number;
  private readonly acquireTimeoutMs: number;
  private readonly idleTimeoutMs: number;

  constructor(
    private readonly resolver: DriverConnectionResolver,
    config: ConnectionPoolConfig = {},
  ) {
    this.max = config.max ?? 10;
    this.min = config.min ?? 0;
    this.acquireTimeoutMs = config.acquireTimeout ?? 30_000;
    this.idleTimeoutMs = config.idleTimeout ?? 30_000;

    this._initializeMinConnections();
  }

  async acquire(): Promise<DriverConnection> {
    if (this.destroyed) {
      throw new Error('Connection pool has been destroyed');
    }

    const idleConn = this.idle.shift();
    if (idleConn !== undefined) {
      this._cancelIdleTimer(idleConn);
      this.active.add(idleConn);
      return idleConn;
    }

    // Include pendingCreations in the capacity check to prevent race conditions
    // where concurrent acquire() calls each see capacity and overshoot `max`.
    if (this.active.size + this.pendingCreations < this.max) {
      this.pendingCreations++;

      try {
        const conn = await this.resolver();

        if (this.destroyed) {
          try {
            await conn.disconnect();
          } catch {
            /* ignore */
          }
          throw new Error('Connection pool has been destroyed');
        }

        this.active.add(conn);
        return conn;
      } finally {
        this.pendingCreations--;
      }
    }

    return new Promise<DriverConnection>((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.waiters.findIndex((w) => w.timer === timer);
        if (idx >= 0) {
          this.waiters.splice(idx, 1);
        }
        reject(new Error(`Connection pool acquire timeout after ${this.acquireTimeoutMs}ms`));
      }, this.acquireTimeoutMs);

      if (typeof timer.unref === 'function') timer.unref();
      this.waiters.push({ resolve, reject, timer });
    });
  }

  async release(connection: DriverConnection): Promise<void> {
    if (!this.active.has(connection)) {
      return;
    }
    this.active.delete(connection);

    if (this.destroyed) {
      try {
        await connection.disconnect();
      } catch { /* ignore */ }
      return;
    }

    const waiter = this.waiters.shift();
    if (waiter) {
      clearTimeout(waiter.timer);
      this.active.add(connection);
      waiter.resolve(connection);
      return;
    }

    this.idle.push(connection);
    this._startIdleTimer(connection);
  }

  async discard(connection: DriverConnection): Promise<void> {
    this.active.delete(connection);

    const idleIdx = this.idle.indexOf(connection);
    if (idleIdx >= 0) {
      this.idle.splice(idleIdx, 1);
      this._cancelIdleTimer(connection);
    }

    try {
      await connection.disconnect();
    } catch {
      /* ignore — connection is likely already dead */
    }

    // Discarding frees capacity; try to service queued waiters.
    this._pumpWaiters();
  }

  async destroy(): Promise<void> {
    if (this.destroyed) return;
    this.destroyed = true;

    for (const w of this.waiters) {
      clearTimeout(w.timer);
      w.reject(new Error('Connection pool has been destroyed'));
    }
    this.waiters = [];

    for (const timer of this.idleTimers.values()) {
      clearTimeout(timer);
    }
    this.idleTimers.clear();

    const all = [...this.idle, ...this.active];
    this.idle = [];
    this.active.clear();

    await Promise.all(
      all.map((c) =>
        c.disconnect().catch(() => {
          /* ignore */
        }),
      ),
    );
  }

  getPoolSize(): { total: number; idle: number; active: number; pending: number } {
    return {
      total  : this.idle.length + this.active.size + this.pendingCreations,
      idle   : this.idle.length,
      active : this.active.size,
      pending: this.pendingCreations,
    };
  }

  // --- Private Helpers ---

  private _cancelIdleTimer(conn: DriverConnection): void {
    const timer = this.idleTimers.get(conn);
    if (timer) {
      clearTimeout(timer);
      this.idleTimers.delete(conn);
    }
  }

  private _startIdleTimer(connection: DriverConnection): void {
    if (this.idleTimeoutMs <= 0) return;

    const timer = setTimeout(() => {
      const idx = this.idle.indexOf(connection);
      if (idx >= 0) {
        this.idle.splice(idx, 1);
        this.idleTimers.delete(connection);
        connection.disconnect().catch(() => {
          /* ignore */
        });
      }
    }, this.idleTimeoutMs);

    if (typeof timer.unref === 'function') timer.unref();
    this.idleTimers.set(connection, timer);
  }

  private _initializeMinConnections(): void {
    for (let i = 0; i < this.min; i++) {
      this.pendingCreations++;
      this.resolver()
        .then((conn) => {
          if (this.destroyed) {
            conn.disconnect().catch(() => {});
          } else {
            this.idle.push(conn);
            this._startIdleTimer(conn);
          }
        })
        .catch(() => {
          /* ignore initial connection errors for background min-pool fill */
        })
        .finally(() => {
          this.pendingCreations--;
        });
    }
  }

  private _pumpWaiters(): void {
    if (this.waiters.length > 0 && this.active.size + this.pendingCreations < this.max) {
      const waiter = this.waiters.shift();
      if (!waiter) return;
      clearTimeout(waiter.timer);

      this.pendingCreations++;
      this.resolver()
        .then((conn) => {
          if (this.destroyed) {
            conn.disconnect().catch(() => {});
            waiter.reject(new Error('Connection pool has been destroyed'));
          } else {
            this.active.add(conn);
            waiter.resolve(conn);
          }
        })
        .catch((err) => {
          waiter.reject(err);
        })
        .finally(() => {
          this.pendingCreations--;
          this._pumpWaiters();
        });
    }
  }
}
