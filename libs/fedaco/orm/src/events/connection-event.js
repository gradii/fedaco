/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export class ConnectionEvent {
  constructor(connection) {
    this.connection = connection
    this.connectionName = connection.getName()
  }
}
