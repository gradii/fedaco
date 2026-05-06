/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { DriverConnection } from './driver-connection';

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
