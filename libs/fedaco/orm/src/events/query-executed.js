/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export class QueryExecuted {
  constructor(sql, bindings, time, connection) {
    this.sql = sql
    this.time = time
    this.bindings = bindings
    this.connection = connection
    this.connectionName = connection.getName()
  }
}
