/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Connection } from '../connection';

export class QueryExecuted {
  /* The SQL query that was executed. */
  public sql: string;
  /* The array of query bindings. */
  public bindings: any[];
  /* The number of milliseconds it took to execute the query. */
  public time: number;
  /* The database connection instance. */
  public connection: Connection;
  /* The database connection name. */
  public connectionName: string;

  /* Create a new event instance. */
  public constructor(sql: string, bindings: any[], time: number | null, connection: Connection) {
    this.sql = sql;
    this.time = time;
    this.bindings = bindings;
    this.connection = connection;
    this.connectionName = connection.getName();
  }
}
