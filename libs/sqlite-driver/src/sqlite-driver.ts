/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { ConnectionConfig, DatabaseDriver, DriverConnection, DriverConnectionResolver } from '@gradii/fedaco';
import { connectWithHosts } from '@gradii/fedaco';
import { SqliteConnection } from './connection/sqlite-connection';
import { SqliteConnector } from './connector/sqlite-connector';
import { isPresent } from '@gradii/nanofn';

export function sqliteDriver(driverConfig?: ConnectionConfig): DatabaseDriver {
  return {
    name: driverConfig?.driver ?? 'sqlite',
    createConnector: async (config: any): Promise<DriverConnection> => {
      const conn = await connectWithHosts(config, new SqliteConnector());

      if (isPresent(config['foreign_key_constraints'])) {
        if (config['foreign_key_constraints']) {
          await conn.execute('PRAGMA foreign_keys = ON;');
        } else {
          await conn.execute('PRAGMA foreign_keys = OFF;');
        }
      }
      return conn;
    },
    createConnection: (
      pdo: DriverConnection | DriverConnectionResolver,
      database: string,
      prefix: string,
      config: any,
    ) => {
      const mergedConfig = { ...config, ...driverConfig };
      return new SqliteConnection(
        pdo,
        driverConfig?.database ?? database,
        driverConfig?.prefix ?? prefix,
        mergedConfig,
      );
    },
  };
}
