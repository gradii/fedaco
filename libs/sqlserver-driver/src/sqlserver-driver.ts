/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type {
  ConnectionConfig,
  DatabaseDriver,
  WrappedConnection,
  WrappedConnectionResolver,
} from '@gradii/fedaco';
import { connectWithHosts } from '@gradii/fedaco';
import { SqlServerConnection } from './connection/sql-server-connection';
import { SqlServerConnector } from './connector/sql-server-connector';

export function sqlserverDriver(driverConfig?: ConnectionConfig): DatabaseDriver {
  return {
    name: driverConfig?.driver ?? 'sqlsrv',
    createConnector: (config: any): Promise<WrappedConnection> =>
      connectWithHosts(config, new SqlServerConnector()),
    createConnection: (
      pdo: WrappedConnection | WrappedConnectionResolver,
      database: string,
      prefix: string,
      config: any,
    ) => {
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
