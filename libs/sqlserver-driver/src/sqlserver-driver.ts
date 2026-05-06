/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { DatabaseDriver } from '@gradii/fedaco';
import { SqlServerConnection } from './connection/sql-server-connection';
import { SqlServerConnector } from './connector/sql-server-connector';

export function sqlserverDriver(): DatabaseDriver {
  return {
    name            : 'sqlsrv',
    createConnector : () => new SqlServerConnector(),
    createConnection: (pdo, database, prefix, config) =>
      new SqlServerConnection(pdo, database, prefix, config),
  };
}
