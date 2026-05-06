/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { DatabaseDriver } from '@gradii/fedaco';
import { PostgresConnection } from './connection/postgres-connection';
import { PostgresConnector } from './connector/postgres-connector';

export function postgresDriver(): DatabaseDriver {
  return {
    name            : 'pgsql',
    createConnector : () => new PostgresConnector(),
    createConnection: (pdo, database, prefix, config) =>
      new PostgresConnection(pdo, database, prefix, config),
  };
}
