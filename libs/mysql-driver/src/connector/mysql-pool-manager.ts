/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { ConnectionPoolConfig, ConnectionPoolManager, DriverConnection } from '@gradii/fedaco';
import type { Pool, PoolConnection } from 'mysql2/promise';
import { MysqlDriverConnection } from './mysql-driver-connection';

/**
 * Connection pool manager for MySQL using mysql2/promise.
 *
 * Manages a pool of MySQL connections for efficient connection reuse
 * in concurrent transaction scenarios.
 */
export class MysqlPoolManager implements ConnectionPoolManager {
  private pool: Pool;
  private activeConnections = new Map<DriverConnection, PoolConnection>();

  constructor(config: any, poolConfig: ConnectionPoolConfig) {
    // Dynamic import to avoid loading mysql2 if not needed
    const mysql2 = require('mysql2/promise');

    this.pool = mysql2.createPool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      timezone: config.timezone,
      ssl: config.ssl,
      connectionLimit: poolConfig.max || 10,
      waitForConnections: true,
      queueLimit: 0,
      acquireTimeout: poolConfig.acquireTimeout || 30000,
      idleTimeout: poolConfig.idleTimeout || 30000,
    });
  }

  async acquire(): Promise<DriverConnection> {
    const poolConnection = await this.pool.getConnection();
    // PoolConnection has a connection property that is the actual Connection
    const wrapped = new MysqlDriverConnection((poolConnection as any).connection);
    this.activeConnections.set(wrapped, poolConnection);
    return wrapped;
  }

  async release(connection: DriverConnection): Promise<void> {
    const poolConnection = this.activeConnections.get(connection);
    if (poolConnection) {
      poolConnection.release();
      this.activeConnections.delete(connection);
    }
  }

  async destroy(): Promise<void> {
    await this.pool.end();
    this.activeConnections.clear();
  }

  getPoolSize(): { total: number; idle: number; active: number } {
    // Access internal pool state
    const poolInternal = (this.pool as any).pool;
    return {
      total: poolInternal._allConnections?.length || 0,
      idle: poolInternal._freeConnections?.length || 0,
      active: this.activeConnections.size,
    };
  }
}
