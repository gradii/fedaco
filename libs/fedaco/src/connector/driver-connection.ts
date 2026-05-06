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
