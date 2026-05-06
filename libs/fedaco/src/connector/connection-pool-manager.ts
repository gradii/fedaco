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
   * Destroy the pool and close all connections.
   */
  destroy(): Promise<void>;

  /**
   * Get current pool statistics.
   *
   * @returns Object containing total, idle, and active connection counts
   */
  getPoolSize(): { total: number; idle: number; active: number };
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
 *   - `destroy()` rejects pending waiters and closes every connection
 *     (idle + active).
 *
 * Idle/acquire timeouts default to 30s. `unref`-ing the timers prevents the
 * pool from keeping the event loop alive on its own.
 */
export class DefaultConnectionPoolManager implements ConnectionPoolManager {
  private idle: DriverConnection[] = [];
  private active: Set<DriverConnection> = new Set();
  private waiters: Array<{
    resolve: (c: DriverConnection) => void;
    reject : (e: Error) => void;
    timer  : ReturnType<typeof setTimeout>;
  }> = [];

  private idleTimers: Map<DriverConnection, ReturnType<typeof setTimeout>> = new Map();
  private destroyed = false;

  private readonly max: number;
  private readonly acquireTimeoutMs: number;
  private readonly idleTimeoutMs: number;

  constructor(
    private readonly resolver: DriverConnectionResolver,
    config: ConnectionPoolConfig = {},
  ) {
    this.max = config.max ?? 10;
    this.acquireTimeoutMs = config.acquireTimeout ?? 30_000;
    this.idleTimeoutMs = config.idleTimeout ?? 30_000;
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

    if (this.active.size < this.max) {
      const conn = await this.resolver();
      // The resolver completed — but if destroy() ran concurrently we should
      // close this stray connection and refuse the acquire.
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
      // Released twice or never acquired here — nothing to do.
      return;
    }
    this.active.delete(connection);

    if (this.destroyed) {
      try {
        await connection.disconnect();
      } catch {
        /* ignore */
      }
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
    if (this.idleTimeoutMs > 0) {
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

  getPoolSize(): { total: number; idle: number; active: number } {
    return {
      total : this.idle.length + this.active.size,
      idle  : this.idle.length,
      active: this.active.size,
    };
  }

  private _cancelIdleTimer(conn: DriverConnection): void {
    const timer = this.idleTimers.get(conn);
    if (timer) {
      clearTimeout(timer);
      this.idleTimers.delete(conn);
    }
  }
}
