export class QueryExecuted {

  constructor(sql, bindings, time, connection) {
    this.sql = sql;
    this.time = time;
    this.bindings = bindings;
    this.connection = connection;
    this.connectionName = connection.getName();
  }
}
