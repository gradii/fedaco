/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { WrappedConnection } from '../wrapped-connection';
import { PostgresWrappedStmt } from './postgres-wrapped-stmt';
import type { Client } from 'pg';

export class PostgresWrappedConnection implements WrappedConnection {
  lastError: string;

  constructor(public driver: Client) {
    driver.on('error', (e: any) => {
      this.lastError = e.message;
    });
  }

  async prepare(sql: string): Promise<PostgresWrappedStmt> {
    return Promise.resolve(new PostgresWrappedStmt(this.driver, sql));
  }

  async exec(sql: string) {
    return this.driver.query(sql);
  }

  async execute(sql: string, bindings?: any[]): Promise<any> {
    return this.driver.query(sql, bindings);
  }

  // run(sql: string, bindings: any[], callback: (err: string, rows: any[]) => void) {
  //   this.driver.run(sql, bindings, callback);
  // }
  //
  // async get(sql: string, bindings: any[], callback: (err: string, rows: any[]) => void) {
  //   // return this.driver.get(sql, bindings, callback);
  // }

  async lastInsertId(): Promise<number> {
    throw new Error('not supported. since postgres native support insert get id');
  }

  beginTransaction(): Promise<any> {
    return Promise.resolve(undefined);
  }

  commit(): Promise<any> {
    return Promise.resolve(undefined);
  }

  rollBack(): Promise<any> {
    return Promise.resolve(undefined);
  }

}
