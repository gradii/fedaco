/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Connection } from '../connection';
import type { WrappedConnection } from '../connector/wrapped-connection';

/**
 * Lazy resolver of the underlying {@link WrappedConnection}. Connection
 * stores this so it can re-establish the link on reconnect.
 */
export type WrappedConnectionResolver = () => Promise<WrappedConnection>;

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

  /**
   * Open a low-level wrapped connection for the given config. Must return a
   * Promise — the underlying network/native connect is async.
   *
   * Drivers are responsible for handling cluster vs single-host configs:
   * use {@link connectWithHosts} from `@gradii/fedaco` to delegate that
   * policy. (Cluster = `config.host` is an array → try each with retry.
   * Single host or no host → connect directly.)
   */
  createConnector(config: any): Promise<WrappedConnection>;

  /**
   * Build the high-level Connection wrapper around a resolved pdo handle.
   * Sync — `db()` / `schema()` return a Connection synchronously to user
   * code, and the connection-factory creates the Connection object eagerly
   * during `manager.connection()`.
   *
   * The first parameter is either an already-resolved {@link
   * WrappedConnection} or a lazy resolver function — never an arbitrary
   * `Function`. The lazy form lets Connection re-invoke the resolver when
   * reconnecting.
   */
  createConnection(
    pdo: WrappedConnection | WrappedConnectionResolver,
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
 *
 * Sync only: the factory is consumed by the sync `createConnection` path,
 * so an async factory would fail there. (The async pdo resolver path also
 * uses this factory, so keeping a single sync contract avoids "works here
 * but not there" surprises.)
 */
export type DatabaseDriverFactory =
  | DatabaseDriver
  | ((config: any) => DatabaseDriver);

/** Resolve a factory to the underlying driver instance. */
export function resolveDatabaseDriver(
  factory: DatabaseDriverFactory,
  config: any,
): DatabaseDriver {
  return typeof factory === 'function' ? factory(config) : factory;
}
