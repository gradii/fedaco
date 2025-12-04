/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Database } from 'sqlite3';
import type { WrappedConnection } from '../wrapped-connection';
import { SqliteWrappedStmt } from './sqlite-wrapped-stmt';

export class SqliteWrappedConnection implements WrappedConnection {
  constructor(public driver: Database) {}

  execute(sql: string, bindings?: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.driver.run(sql, bindings, (err: string) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }

  async prepare(sql: string): Promise<SqliteWrappedStmt> {
    return new Promise((resolve, reject) => {
      const stmt = this.driver.prepare(sql, (err: string) => {
        if (err) {
          return reject(err);
        }

        resolve(new SqliteWrappedStmt(stmt));
      });
    });
    // return new SqliteWrappedStmt(this.driver.prepare(sql));
  }

  // run(sql: string, bindings: any[], callback: (err: string, rows: any[]) => void) {
  //   this.driver.run(sql, bindings, callback);
  // }
  //
  // async get(sql: string, bindings: any[], callback: (err: string, rows: any[]) => void) {
  //   // return this.driver.get(sql, bindings, callback);
  // }

  async lastInsertId(): Promise<number> {
    return new Promise((ok, fail) => {
      this.driver.get('select last_insert_rowid()', (err, data: any) => {
        if (err) {
          fail(err);
        } else {
          ok(data && data['last_insert_rowid()']);
        }
      });
    });
  }

  beginTransaction(): Promise<void> {
    return new Promise((ok, fail) => {
      this.driver.run('BEGIN TRANSACTION;', (err) => {
        if (err) {
          fail(err);
        } else {
          ok();
        }
      });
    });
  }

  commit(): Promise<void> {
    return new Promise((ok, fail) => {
      this.driver.run('COMMIT;', (err) => {
        if (err) {
          fail(err);
        } else {
          ok();
        }
      });
    });
  }

  rollBack(): Promise<void> {
    return new Promise((ok, fail) => {
      this.driver.run('ROLLBACK;', (err) => {
        if (err) {
          fail(err);
        } else {
          ok();
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((ok, fail) => {
      this.driver.close((err) => {
        if (err) {
          return fail(err);
        }
        ok();
      });
    });
  }
}
