/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Connection } from 'tedious';
import type { DriverConnection } from '@gradii/fedaco';
import { SqlServerDriverStmt } from './sql-server-driver-stmt';

export class SqlServerDriverConnection implements DriverConnection {
  constructor(public driver: Connection) {}

  async execute(sql: string, bindings?: any[]): Promise<void> {
    let count = 0;
    sql.replace(/\?/g, () => `@val${++count}`);
    const { Request } = await import('tedious');
    return new Promise((ok, fail) => {
      this.driver.execute(
        new Request(sql, (err) => {
          if (err) {
            fail(err);
          } else {
            ok();
          }
        }),
        (bindings ? bindings : []).reduce((prev, curr, index) => {
          prev[`val${index + 1}`] = curr;
        }, {}),
      );
    });
  }

  async prepare(sql: string): Promise<SqlServerDriverStmt> {
    return new SqlServerDriverStmt(this.driver, sql);
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

  async disconnect(): Promise<void> {
    this.driver.close();
  }
}
