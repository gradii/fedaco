/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Connection } from '../connection';

export class SchemaLoaded {
  /*The database connection instance.*/
  public connection: Connection;
  /*The database connection name.*/
  public connectionName: string;
  /*The path to the schema dump.*/
  public path: string;

  /*Create a new event instance.*/
  public constructor(connection: Connection, path: string) {
    this.connection     = connection;
    this.connectionName = connection.getName();
    this.path           = path;
  }
}
