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
import { MysqlConnection } from './connection/mysql-connection';
import { MysqlConnector } from './connector/mysql-connector';

export function mysqlDriver(driverConfig?: ConnectionConfig): DatabaseDriver {
  return {
    name: driverConfig?.driver ?? 'mysql',
    createConnector: (config: any): Promise<WrappedConnection> =>
      connectWithHosts(config, new MysqlConnector()),
    createConnection: (
      pdo: WrappedConnection | WrappedConnectionResolver,
      database: string,
      prefix: string,
      config: any,
    ) => {
      const mergedConfig = { ...config, ...driverConfig };
      return new MysqlConnection(
        pdo,
        driverConfig?.database ?? database,
        driverConfig?.prefix ?? prefix,
        mergedConfig,
      );
    },
  };
}

export function mariadbDriver(driverConfig?: ConnectionConfig): DatabaseDriver {
  return {
    name: driverConfig?.driver ?? 'mariadb',
    createConnector: (config: any): Promise<WrappedConnection> =>
      connectWithHosts(config, new MysqlConnector()),
    createConnection: (
      pdo: WrappedConnection | WrappedConnectionResolver,
      database: string,
      prefix: string,
      config: any,
    ) => {
      const mergedConfig = { ...config, ...driverConfig };
      return new MysqlConnection(
        pdo,
        driverConfig?.database ?? database,
        driverConfig?.prefix ?? prefix,
        mergedConfig,
      );
    },
  };
}
