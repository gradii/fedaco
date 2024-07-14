export class Migration {
  /*The name of the database connection to use.*/
  _connection: string | null;
  /*Enables, if supported, wrapping the migration within a transaction.*/
  _withinTransaction = true;

  /*Get the migration connection name.*/
  public getConnection() {
    return this._connection;
  }
}
