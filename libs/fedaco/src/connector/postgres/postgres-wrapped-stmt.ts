/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Client } from 'pg';
import type { WrappedStmt } from '../wrapped-stmt';

export class PostgresWrappedStmt implements WrappedStmt {
  private _bindingValues: any[] = [];

  _affectRows: number;

  constructor(public driverConnection: Client, public sqlStmt: string) {
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

    return result;
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
