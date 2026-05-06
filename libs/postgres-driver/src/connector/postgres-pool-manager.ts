/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { ConnectionPoolConfig, ConnectionPoolManager, DriverConnection } from '@gradii/fedaco';
import { Pool, type PoolClient } from 'pg';
import { PostgresDriverConnection } from './postgres-driver-connection';

/**
 * Connection pool manager for PostgreSQL using pg.Pool.
 *
 * Manages a pool of PostgreSQL connections for efficient connection reuse
 * in concurrent transaction scenarios.
 */
export class PostgresPoolManager implements ConnectionPoolManager {
  private pool: Pool;
  private activeConnections = new Map<DriverConnection, PoolClient>();

  constructor(config: any, poolConfig: ConnectionPoolConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      max: poolConfig.max || 10,
      min: poolConfig.min || 2,
      idleTimeoutMillis: poolConfig.idleTimeout || 30000,
      connectionTimeoutMillis: poolConfig.acquireTimeout || 30000,
      ssl: config.ssl,
    });
  }

  async acquire(): Promise<DriverConnection> {
    const client = await this.pool.connect();
    // PoolClient is compatible with Client for our purposes
    const wrapped = new PostgresDriverConnection(client as any);
    this.activeConnections.set(wrapped, client);
    return wrapped;
  }

  async release(connection: DriverConnection): Promise<void> {
    const client = this.activeConnections.get(connection);
    if (client) {
      client.release();
      this.activeConnections.delete(connection);
    }
  }

  async destroy(): Promise<void> {
    await this.pool.end();
    this.activeConnections.clear();
  }

  getPoolSize(): { total: number; idle: number; active: number } {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      active: this.activeConnections.size,
    };
  }
}
