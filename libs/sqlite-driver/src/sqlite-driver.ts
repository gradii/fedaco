/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { ConnectionConfig, DatabaseDriver } from '@gradii/fedaco';
import { SqliteConnection } from './connection/sqlite-connection';
import { SqliteConnector } from './connector/sqlite-connector';

export function sqliteDriver(driverConfig?: ConnectionConfig): DatabaseDriver {
  return {
    name: driverConfig?.driver ?? 'sqlite',
    createConnector: () => new SqliteConnector(),
    createConnection: (pdo, database, prefix, config) => {
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
