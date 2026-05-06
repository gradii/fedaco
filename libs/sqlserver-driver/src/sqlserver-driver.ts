/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { ConnectionConfig, DatabaseDriver } from '@gradii/fedaco';
import { SqlServerConnection } from './connection/sql-server-connection';
import { SqlServerConnector } from './connector/sql-server-connector';

export function sqlserverDriver(driverConfig?: ConnectionConfig): DatabaseDriver {
  return {
    name: driverConfig?.driver ?? 'sqlsrv',
    createConnector: () => new SqlServerConnector(),
    createConnection: (pdo, database, prefix, config) => {
      const mergedConfig = { ...config, ...driverConfig };
      return new SqlServerConnection(
        pdo,
        driverConfig?.database ?? database,
        driverConfig?.prefix ?? prefix,
        mergedConfig,
      );
    },
  };
}
