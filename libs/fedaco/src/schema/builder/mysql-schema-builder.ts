/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SchemaBuilder } from '../schema-builder';

export class MysqlSchemaBuilder extends SchemaBuilder {
  /*Create a database in the schema.*/
  public createDatabase(name: string) {
    return this.connection.statement(this.grammar.compileCreateDatabase(name, this.connection));
  }

  /*Drop a database from the schema if the database exists.*/
  public dropDatabaseIfExists(name: string) {
    return this.connection.statement(this.grammar.compileDropDatabaseIfExists(name));
  }

  /*Determine if the given table exists.*/
  public async hasTable(table: string): Promise<boolean> {
    table        = this.connection.getTablePrefix() + table;
    const result = await this.connection.select(this.grammar.compileTableExists(),
      [this.connection.getDatabaseName(), table]);
    return result.length > 0;
  }

  /*Get the column listing for a given table.*/
  public async getColumnListing(table: string) {
    table         = this.connection.getTablePrefix() + table;
    const results = await this.connection.select(this.grammar.compileColumnListing(),
      [this.connection.getDatabaseName(), table]);
    return this.connection.getPostProcessor().processColumnListing(results);
  }

  /*Drop all tables from the database.*/
  public async dropAllTables() {
    const tables: string[] = [];
    const result = await this.getAllTables();
    for (const row of result) {
      tables.push(Object.values(row)[0] as string);
    }
    if (!tables.length) {
      return;
    }
    await this.disableForeignKeyConstraints();
    await this.connection.statement(this.grammar.compileDropAllTables(tables));
    await this.enableForeignKeyConstraints();
  }

  /*Drop all views from the database.*/
  public async dropAllViews() {
    const views  = [];
    const result = await this.getAllViews();
    for (const row of result) {
      views.push(row);
    }
    if (!views.length) {
      return;
    }
    await this.connection.statement(this.grammar.compileDropAllViews(views));
  }

  /*Get all of the table names for the database.*/
  public getAllTables() {
    return this.connection.select(this.grammar.compileGetAllTables());
  }

  /*Get all of the view names for the database.*/
  public getAllViews() {
    return this.connection.select(this.grammar.compileGetAllViews());
  }
}
