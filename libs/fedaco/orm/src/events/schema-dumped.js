export class SchemaDumped {
  constructor(connection, path) {
    this.connection = connection
    this.connectionName = connection.getName()
    this.path = path
  }
}
