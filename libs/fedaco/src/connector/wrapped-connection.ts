/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { WrappedStmt } from './wrapped-stmt';

export interface WrappedConnection {
  prepare(sql: string): Promise<WrappedStmt>;

  execute(sql: string, bindings?: any[]): Promise<any>;

  // run(sql: string, bindings: any[], callback: (err: string, rows: any[]) => void): Promise<void>;
  //
  // get(sql: string, bindings: any[], callback: (err: string, rows: any[]) => void): Promise<any[]>;

  lastInsertId(): Promise<number>;

  commit(): Promise<any>;

  beginTransaction(): Promise<any>;

  rollBack(): Promise<any>;

  disconnect(): void;
}
