/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Connection } from '../connection';
import type { ConnectorInterface } from '../connector/connector-interface';

/**
 * Per-connection driver factory provided in `ConnectionConfig.factory`.
 *
 * Driver libraries (e.g. `@gradii/fedaco-sqlite-driver`) expose a function
 * like `sqliteDriver(config?)` that returns one of these. The factory carries
 * the concrete connector + connection wiring so that fedaco itself does not
 * need to ship driver-specific classes or their native dependencies.
 */
export interface DatabaseDriver {
  /**
   * Driver name. Must match the `driver` field on the connection config so
   * that grammar/version branching (e.g. mysql vs mariadb) keeps working.
   */
  readonly name: string;

  /** Build a fresh connector used to open a low-level connection. */
  createConnector(): ConnectorInterface;

  /** Build the high-level Connection wrapper around a resolved pdo handle. */
  createConnection(
    pdo: Function,
    database: string,
    prefix: string,
    config: any,
  ): Connection;
}

/**
 * Accepted shapes for `ConnectionConfig.factory`. A driver lib may expose
 * the driver object directly, or a function that produces one — the latter
 * lets one function serve related dialects (e.g. mysql/mariadb) by reading
 * the connection config.
 */
export type DatabaseDriverFactory =
  | DatabaseDriver
  | ((config: any) => DatabaseDriver | Promise<DatabaseDriver>);

/** Resolve a factory to the underlying driver instance. */
export async function resolveDatabaseDriver(
  factory: DatabaseDriverFactory,
  config: any,
): Promise<DatabaseDriver> {
  return typeof factory === 'function' ? await factory(config) : factory;
}
