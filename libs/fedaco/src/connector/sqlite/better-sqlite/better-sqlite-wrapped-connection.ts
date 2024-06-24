/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Database } from 'better-sqlite3';
import type { WrappedConnection } from '../../wrapped-connection';
import { BetterSqliteWrappedStmt } from './better-sqlite-wrapped-stmt';

export class BetterSqliteWrappedConnection implements WrappedConnection {

  constructor(public driver: Database) {
  }

  async execute(sql: string, bindings?: any[]): Promise<void> {
    await this.driver.prepare(sql).run(bindings ? bindings : []);
  }

  async prepare(sql: string): Promise<BetterSqliteWrappedStmt> {
    return new BetterSqliteWrappedStmt(this.driver.prepare(sql));
  }

  async lastInsertId(): Promise<number> {
    const data: any = this.driver.prepare('select last_insert_rowid()').get();
    return data && data['last_insert_rowid()'];
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
