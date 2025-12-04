/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { RunResult, Statement } from 'sqlite3';
import type { WrappedStmt } from '../wrapped-stmt';

export class SqliteWrappedStmt implements WrappedStmt {
  private _bindingValues: any[] = [];

  _lastInsertId: number;
  _affectRows: number;

  constructor(public driverStmt: Statement) {}

  bindValues(bindings: any[]) {
    this._bindingValues = bindings;
    return this;
  }

  async execute(bindings?: any[]) {
    // @ts-ignore
    const _self = this;

    return new Promise((ok, fail) => {
      this.driverStmt
        .run(...(bindings ?? this._bindingValues), function (this: RunResult, err: string) {
          if (err) {
            return fail(err);
          }
          _self._lastInsertId = this.lastID;
          _self._affectRows = this.changes;
        })
        .finalize((err) => {
          if (err) {
            return fail(err);
          }
          ok(true);
        });
    });
  }

  async fetchAll(bindings?: any[]) {
    return new Promise((ok, fail) => {
      this.driverStmt.all(bindings ?? this._bindingValues, function (this: RunResult, err: string, rows) {
        if (err) {
          return fail(err);
        }
        ok(rows);
      });
      this.driverStmt.finalize((err) => {});
    });
  }

  lastInsertId() {
    return this._lastInsertId;
  }

  affectCount() {
    // @ts-ignore
    // return this.driverStmt.changes;
    return this._affectRows;
  }

  close() {
    // todo improve me. don't know how to close stmt
    this.driverStmt.reset();
    this.driverStmt.finalize();
  }

  bindValue(): this {
    return undefined;
  }
}
