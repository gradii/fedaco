/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Connection } from '../connection';
import type { ConnectionPoolConfig, ConnectionPoolManager } from '../connector/connection-pool-manager';
import type { DriverConnection, DriverConnectionResolver } from '../connector/driver-connection';

// Re-export for backwards compatibility — DriverConnectionResolver lives next
// to DriverConnection now so the pool manager can import it without a cycle.
export type { DriverConnectionResolver } from '../connector/driver-connection';

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
  createConnector(config: any): Promise<DriverConnection>;

  /**
   * Build the high-level Connection wrapper around a resolved driverConnection handle.
   * Sync — `db()` / `schema()` return a Connection synchronously to user
   * code, and the connection-factory creates the Connection object eagerly
   * during `manager.connection()`.
   *
   * The first parameter is either an already-resolved {@link
   * DriverConnection} or a lazy resolver function — never an arbitrary
   * `Function`. The lazy form lets Connection re-invoke the resolver when
   * reconnecting.
   */
  createConnection(
    driverConnection: DriverConnection | DriverConnectionResolver,
    database: string,
    prefix: string,
    config: any,
  ): Connection;

  /**
   * Optional pool-manager factory. When `ConnectionConfig.pool` is set, the
   * connection-factory invokes this with a fresh-connection resolver and
   * the user's pool config; the returned manager backs isolated transactions.
   *
   * The signature mirrors `createConnection` — both consume a
   * {@link DriverConnectionResolver} so drivers don't have to re-derive
   * "how to open a connection" from raw config. Drivers that can't pool
   * (e.g. SQLite, where each connection has its own `:memory:` database)
   * omit this method; isolated transactions then fall back to opening a
   * one-shot driverConnection via `createConnector`.
   */
  createPoolManager?(
    driverConnectionResolver: DriverConnectionResolver,
    poolConfig: ConnectionPoolConfig,
  ): ConnectionPoolManager;
}

/**
 * Accepted shapes for `ConnectionConfig.factory`. A driver lib may expose
 * the driver object directly, or a function that produces one — the latter
 * lets one function serve related dialects (e.g. mysql/mariadb) by reading
 * the connection config.
 *
 * Sync only: the factory is consumed by the sync `createConnection` path,
 * so an async factory would fail there. (The async driverConnection resolver path also
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
