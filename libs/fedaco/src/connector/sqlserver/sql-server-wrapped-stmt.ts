/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Connection } from 'tedious';
import type { WrappedStmt } from '../wrapped-stmt';

export class SqlServerWrappedStmt implements WrappedStmt {
  private _bindingValues: any[] = [];

  _lastInsertId: number | bigint;
  _affectRows: number;

  constructor(
    public driver: Connection,
    public sql: string,
  ) {
    let count = 0;
    this.sql = sql.replace(/\?/g, () => `@val${++count}`);
  }

  bindValues(bindings: any[]) {
    this._bindingValues = bindings;
    return this;
  }

  async execute(bindings?: any[]): Promise<any[]> {
    bindings = bindings || this._bindingValues || [];
    const { Request } = await import('tedious');
    return new Promise((ok, fail) => {
      const request = new Request(this.sql, (err) => {
        if (err) {
          fail(err);
        }
      });
      const list: any[] = [];
      request.on('row', (data) => {
        list.push(data);
      });
      request.on('done', () => {
        ok(list);
      });
      this.driver.prepare(request);
      this.driver.execute(
        request,
        bindings.reduce((prev, curr, index) => {
          prev[`val${index + 1}`] = curr;
        }, {}),
      );
    });
  }

  async fetchAll(bindings?: any[]) {
    return this.execute(bindings);
  }

  lastInsertId() {}

  affectCount() {
    return this._affectRows;
  }

  close() {}

  bindValue(): this {
    return undefined;
  }
}
