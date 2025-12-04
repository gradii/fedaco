/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Connection } from '../connection';

export class ConnectionEvent {
  /* The name of the connection. */
  public connectionName: string;
  /* The database connection instance. */
  public connection: Connection;

  /* Create a new event instance. */
  public constructor(connection: Connection) {
    this.connection = connection;
    this.connectionName = connection.getName();
  }
}
