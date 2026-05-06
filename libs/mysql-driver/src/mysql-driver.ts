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
import { connectWithHosts } from '@gradii/fedaco';
import { MysqlConnection } from './connection/mysql-connection';
import { MysqlConnector } from './connector/mysql-connector';
import { MysqlPoolManager } from './connector/mysql-pool-manager';

export function mysqlDriver(driverConfig?: ConnectionConfig): DatabaseDriver {
  return {
    name: driverConfig?.driver ?? 'mysql',
    createConnector: (config: any): Promise<DriverConnection> =>
      connectWithHosts(config, new MysqlConnector()),
    createConnection: (
      pdo: DriverConnection | DriverConnectionResolver,
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
    createPoolManager: (config, poolConfig) => new MysqlPoolManager(config, poolConfig),
  };
}

export function mariadbDriver(driverConfig?: ConnectionConfig): DatabaseDriver {
  return {
    name: driverConfig?.driver ?? 'mariadb',
    createConnector: (config: any): Promise<DriverConnection> =>
      connectWithHosts(config, new MysqlConnector()),
    createConnection: (
      pdo: DriverConnection | DriverConnectionResolver,
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
    createPoolManager: (config, poolConfig) => new MysqlPoolManager(config, poolConfig),
  };
}
