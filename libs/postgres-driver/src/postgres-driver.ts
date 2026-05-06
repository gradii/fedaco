/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { ConnectionConfig, DatabaseDriver } from '@gradii/fedaco';
import { PostgresConnection } from './connection/postgres-connection';
import { PostgresConnector } from './connector/postgres-connector';

export function postgresDriver(driverConfig?: ConnectionConfig): DatabaseDriver {
  return {
    name            : driverConfig?.driver ?? 'pgsql',
    createConnector : () => new PostgresConnector(),
    createConnection: (pdo, database, prefix, config) => {
      // Driver-param config has priority over the per-call connection config.
      const mergedConfig = { ...config, ...driverConfig };
      return new PostgresConnection(
        pdo,
        driverConfig?.database ?? database,
        driverConfig?.prefix ?? prefix,
        mergedConfig,
      );
    },
  };
}
