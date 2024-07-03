/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SchemaBuilder } from '../schema-builder';

export class SqlServerSchemaBuilder extends SchemaBuilder {
  /*Create a database in the schema.*/
  public async createDatabase(name: string) {
    return this.connection.statement(this.grammar.compileCreateDatabase(name, this.connection));
  }

  /*Drop a database from the schema if the database exists.*/
  public async dropDatabaseIfExists(name: string) {
    return this.connection.statement(this.grammar.compileDropDatabaseIfExists(name));
  }

  /*Drop all tables from the database.*/
  public async dropAllTables() {
    await this.connection.statement(this.grammar.compileDropAllForeignKeys());
    await this.connection.statement(this.grammar.compileDropAllTables());
  }

  /*Drop all views from the database.*/
  public async dropAllViews() {
    await this.connection.statement(this.grammar.compileDropAllViews());
  }
}
