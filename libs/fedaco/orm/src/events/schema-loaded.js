/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export class SchemaLoaded {
  constructor(connection, path) {
    this.connection = connection
    this.connectionName = connection.getName()
    this.path = path
  }
}
