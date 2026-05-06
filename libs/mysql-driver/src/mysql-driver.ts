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
import { MysqlConnection } from './connection/mysql-connection';
import { MysqlConnector } from './connector/mysql-connector';

export function mysqlDriver(driverConfig?: ConnectionConfig): DatabaseDriver {
  return {
    name: driverConfig?.driver ?? 'mysql',
    createConnector: (config: any): Promise<DriverConnection> =>
      connectWithHosts(config, new MysqlConnector()),
    createConnection: (
      driverConnection: DriverConnection | DriverConnectionResolver,
      database: string,
      prefix: string,
      config: any,
    ) => {
      const mergedConfig = { ...config, ...driverConfig };
      return new MysqlConnection(
        driverConnection,
        driverConfig?.database ?? database,
        driverConfig?.prefix ?? prefix,
        mergedConfig,
      );
    },
    createPoolManager: (driverConnectionResolver, poolConfig) =>
      new DefaultConnectionPoolManager(driverConnectionResolver, poolConfig),
  };
}

export function mariadbDriver(driverConfig?: ConnectionConfig): DatabaseDriver {
  return {
    name: driverConfig?.driver ?? 'mariadb',
    createConnector: (config: any): Promise<DriverConnection> =>
      connectWithHosts(config, new MysqlConnector()),
    createConnection: (
      driverConnection: DriverConnection | DriverConnectionResolver,
      database: string,
      prefix: string,
      config: any,
    ) => {
      const mergedConfig = { ...config, ...driverConfig };
      return new MysqlConnection(
        driverConnection,
        driverConfig?.database ?? database,
        driverConfig?.prefix ?? prefix,
        mergedConfig,
      );
    },
    createPoolManager: (driverConnectionResolver, poolConfig) =>
      new DefaultConnectionPoolManager(driverConnectionResolver, poolConfig),
  };
}
