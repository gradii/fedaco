/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Connection } from '../connection';

export class StatementPrepared {
  /* The database connection instance. */
  public connection: Connection;
  /* The PDO statement. */
  public statement: any;

  /* Create a new event instance. */
  public constructor(connection: Connection, statement: any) {
    this.statement = statement;
    this.connection = connection;
  }
}
