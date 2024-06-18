/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Statement } from 'better-sqlite3';
import type { WrappedStmt } from '../../wrapped-stmt';

export class BetterSqliteWrappedStmt implements WrappedStmt {
  private _bindingValues: any[] = [];

  _lastInsertId: number | bigint;
  _affectRows: number;

  constructor(public driverStmt: Statement) {
  }

  bindValues(bindings: any[]) {
    this._bindingValues = bindings;
    return this;
  }

  async execute(bindings?: any[]) {
    const runResult = this.driverStmt
      .run(...(bindings ?? this._bindingValues));

    this._lastInsertId = runResult.lastInsertRowid;
    this._affectRows   = runResult.changes;

    return true;
  }

  async fetchAll(bindings?: any[]) {
    return this.driverStmt.all(bindings ?? this._bindingValues);
  }

  lastInsertId() {
    return this._lastInsertId;
  }

  affectCount() {
    return this._affectRows;
  }

  close() {
  }

  bindValue(): this {
    return undefined;
  }
}
