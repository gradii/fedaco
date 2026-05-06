/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type {
  ConnectionConfig,
  DatabaseDriver,
  DriverConnection,
  DriverConnectionResolver,
} from '@gradii/fedaco';
import { connectWithHosts, DefaultConnectionPoolManager } from '@gradii/fedaco';
import { PostgresConnection } from './connection/postgres-connection';
import { PostgresConnector } from './connector/postgres-connector';

export function postgresDriver(driverConfig?: ConnectionConfig): DatabaseDriver {
  return {
    name: driverConfig?.driver ?? 'pgsql',
    createConnector: (config: any): Promise<DriverConnection> =>
      connectWithHosts(config, new PostgresConnector()),
    createConnection: (
      pdo: DriverConnection | DriverConnectionResolver,
      database: string,
      prefix: string,
      config: any,
    ) => {
      // Driver-param config has priority over the per-call connection config.
      const mergedConfig = { ...config, ...driverConfig };
      return new PostgresConnection(
        pdo,
        driverConfig?.database ?? database,
        driverConfig?.prefix ?? prefix,
        mergedConfig,
      );
    },
    createPoolManager: (pdoResolver, poolConfig) =>
      new DefaultConnectionPoolManager(pdoResolver, poolConfig),
  };
}
