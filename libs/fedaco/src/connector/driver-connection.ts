/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { DriverStmt } from './driver-stmt';

export interface DriverConnection {
  prepare(sql: string): Promise<DriverStmt>;

  execute(sql: string, bindings?: any[]): Promise<any>;

  // run(sql: string, bindings: any[], callback: (err: string, rows: any[]) => void): Promise<void>;
  //
  // get(sql: string, bindings: any[], callback: (err: string, rows: any[]) => void): Promise<any[]>;

  lastInsertId(): Promise<number>;

  commit(): Promise<any>;

  beginTransaction(): Promise<any>;

  rollBack(): Promise<any>;

  disconnect(): Promise<void>;
}

/**
 * Lazy resolver of a {@link DriverConnection}. Used in two places:
 *
 *  - `Connection` stores one so it can re-establish the link on reconnect.
 *  - `ConnectionPoolManager` calls one to populate the pool — each invocation
 *    must yield a fresh, independent connection.
 *
 * Lives here (not on `database-driver.ts`) so both `Connection` and the pool
 * manager can import it without dragging in the full `DatabaseDriver`
 * surface, which would create a module cycle.
 */
export type DriverConnectionResolver = () => Promise<DriverConnection>;
