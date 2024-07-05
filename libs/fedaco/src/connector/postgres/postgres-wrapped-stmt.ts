/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Client, QueryResult } from 'pg';
import type { WrappedStmt } from '../wrapped-stmt';

export class PostgresWrappedStmt implements WrappedStmt {
  private _bindingValues: any[] = [];

  _affectRows: number;

  constructor(public driverConnection: Client, public sqlStmt: string) {
    let count    = 0;
    this.sqlStmt = this.sqlStmt.replace(/\?/g, () => `$${++count}`);
  }

  bindValues(bindings: any[]) {
    this._bindingValues = bindings;
    return this;
  }

  async execute(bindings?: any[]) {
    await this.driverConnection.query(
      this.sqlStmt,
      bindings ?? this._bindingValues
    );
  }

  async fetchAll(bindings?: any[]) {
    const result = await this.driverConnection.query(
      this.sqlStmt,
      bindings ?? this._bindingValues,
    );

    return result['rows'];
  }

  affectCount() {
    // @ts-ignore
    // return this.driverStmt.changes;
    return this._affectRows;
  }

  close() {
  }

  bindValue(): this {
    return undefined;
  }
}
