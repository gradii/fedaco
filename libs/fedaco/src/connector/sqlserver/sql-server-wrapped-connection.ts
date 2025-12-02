/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Connection } from 'tedious';
import type { WrappedConnection } from '../wrapped-connection';
import { SqlServerWrappedStmt } from './sql-server-wrapped-stmt';

export class SqlServerWrappedConnection implements WrappedConnection {

  constructor(public driver: Connection) {
  }

  async execute(sql: string, bindings?: any[]): Promise<void> {
    let count = 0;
    sql.replace(/\?/g, () => `@val${++count}`);
    const {Request} = await import('tedious');
    return new Promise((ok, fail) => {
      this.driver.execute(new Request(sql, err => {
        if (err) {
          fail(err);
        } else {
          ok();
        }
      }), (bindings ? bindings : []).reduce((prev, curr, index) => {
        prev[`val${index + 1}`] = curr;
      }, {}));
    });
  }

  async prepare(sql: string): Promise<SqlServerWrappedStmt> {
    return new SqlServerWrappedStmt(this.driver, sql);
  }

  async lastInsertId(): Promise<number> {
    const result: any = this.execute('SELECT CAST(COALESCE(SCOPE_IDENTITY(), @@IDENTITY) AS int) AS insertid');
    if (!result) {
      throw new Error('Unable to retrieve lastInsertID.');
    }
    return result && result[0]['last_insert_rowid()'];
  }

  async beginTransaction(): Promise<void> {
    return this.execute('BEGIN TRANSACTION');
  }

  async commit(): Promise<void> {
    return this.execute('COMMIT');
  }

  async rollBack(): Promise<void> {
    return this.execute('ROLLBACK');
  }

  disconnect(): void {
    this.driver.close();
  }

}
