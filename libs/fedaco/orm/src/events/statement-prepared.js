export class StatementPrepared {
  constructor(connection, statement) {
    this.statement = statement
    this.connection = connection
  }
}
