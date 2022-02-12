export class ConnectionEvent {
  constructor(connection) {
    this.connection = connection
    this.connectionName = connection.getName()
  }
}
