/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isObject } from '@gradii/check-type';
import type { Connection, FieldPacket, QueryError } from 'mysql2';
import type { WrappedStmt } from '../wrapped-stmt';

export class MysqlWrappedStmt implements WrappedStmt {
  private _bindingValues: any[] = [];

  _lastInsertId: number;
  _affectRows: number;

  constructor(public driverConnection: Connection, public sqlStmt: string) {
  }

  bindValues(bindings: any[]) {
    this._bindingValues = bindings;
    return this;
  }

  async execute(bindings?: any[]) {
    return new Promise((ok, fail) => {
      this.driverConnection.execute(
        this.sqlStmt,
        bindings ?? this._bindingValues,
        (err: QueryError, result, fields: FieldPacket[]) => {
          if (err) {
            return fail(err);
          }
          ok(result);

          // _self._lastInsertId = this.lastID;
          if (isObject(result) && 'affectedRows' in result) {
            this._affectRows = result.affectedRows;
          } else {
            // this._affectRows = isArray(fields) ? fields.length : fields;
          }
        }
      );
    });
  }

  async fetchAll(bindings?: any[]) {
    return new Promise((ok, fail) => {
      this.driverConnection.query(
        this.sqlStmt,
        bindings ?? this._bindingValues,
        (err: QueryError, result, fields: FieldPacket[]) => {
          if (err) {
            return fail(err);
          }
          ok(result);
        }
      );
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
  }

  bindValue(): this {
    return undefined;
  }
}
