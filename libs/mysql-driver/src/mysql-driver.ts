/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { DatabaseDriver } from '@gradii/fedaco';
import { MysqlConnection } from './connection/mysql-connection';
import { MysqlConnector } from './connector/mysql-connector';

export function mysqlDriver(): DatabaseDriver {
  return {
    name            : 'mysql',
    createConnector : () => new MysqlConnector(),
    createConnection: (pdo, database, prefix, config) =>
      new MysqlConnection(pdo, database, prefix, config),
  };
}

export function mariadbDriver(): DatabaseDriver {
  return {
    name            : 'mariadb',
    createConnector : () => new MysqlConnector(),
    createConnection: (pdo, database, prefix, config) =>
      new MysqlConnection(pdo, database, prefix, config),
  };
}
