/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { DatabaseDriver } from '@gradii/fedaco';
import { SqliteConnection } from './connection/sqlite-connection';
import { SqliteConnector } from './connector/sqlite-connector';

export function sqliteDriver(): DatabaseDriver {
  return {
    name            : 'sqlite',
    createConnector : () => new SqliteConnector(),
    createConnection: (pdo, database, prefix, config) =>
      new SqliteConnection(pdo, database, prefix, config),
  };
}
