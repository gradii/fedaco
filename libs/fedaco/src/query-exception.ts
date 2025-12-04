/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { replaceArray } from './helper/str';


export class QueryException {
  /* The SQL for the query. */
  protected sql: string;
  /* The bindings for the query. */
  protected bindings: any[];

  public message;

  /* Create a new query exception instance. */
  public constructor(sql: string, bindings: any[], message: string) {
    this.sql      = sql;
    this.bindings = bindings;
    this.message  = this.formatMessage(sql, bindings, message);
  }

  /* Format the SQL error message. */
  protected formatMessage(sql: string, bindings: any[], message: string) {
    return `${message} (SQL: ${replaceArray(sql, '?', bindings)})`;
  }

  /* Get the SQL for the query. */
  public getSql() {
    return this.sql;
  }

  /* Get the bindings for the query. */
  public getBindings() {
    return this.bindings;
  }

  toString() {
    return this.message;
  }
}
