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


  /**
   * Get the tables for the database.
   *
   * @return array
   */
  public async getTables(withSize = true) {
    return this.connection.getPostProcessor().processTables(
      await this.connection.selectFromWriteConnection(
        this.grammar.compileTables(this.connection.getDatabaseName())
      )
    );
  }

  /**
   * Get the views for the database.
   *
   * @return array
   */
  public async getViews() {
    return this.connection.getPostProcessor().processViews(
      await this.connection.selectFromWriteConnection(
        this.grammar.compileViews(this.connection.getDatabaseName())
      )
    );
  }

  /**
   * Get the columns for a given table.
   *
   * @param table
   * @return array
   */
  public async getColumns(table: string) {
    table = this.connection.getTablePrefix() + table;

    const results = await this.connection.selectFromWriteConnection(
      this.grammar.compileColumns(this.connection.getDatabaseName(), table)
    );

    return this.connection.getPostProcessor().processColumns(results);
  }

  /**
   * Get the indexes for a given table.
   *
   * @param table
   * @return array
   */
  public async getIndexes(table: string) {
    table = this.connection.getTablePrefix() + table;

    return this.connection.getPostProcessor().processIndexes(
      await this.connection.selectFromWriteConnection(
        this.grammar.compileIndexes(this.connection.getDatabaseName(), table)
      )
    );
  }

  /**
   * Get the foreign keys for a given table.
   *
   * @param table
   * @return array
   */
  public async getForeignKeys(table: string) {
    table = this.connection.getTablePrefix() + table;

    return this.connection.getPostProcessor().processForeignKeys(
      await this.connection.selectFromWriteConnection(
        this.grammar.compileForeignKeys(this.connection.getDatabaseName(), table)
      )
    );
  }

  /*Drop all tables from the database.*/
  public async dropAllTables() {
    const tables: string[] = [];
    const result           = await this.getTables();
    for (const row of result) {
      tables.push(row['name'] as string);
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
    const result = await this.getViews();
    for (const row of result) {
      views.push(row['name']);
    }
    if (!views.length) {
      return;
    }
    await this.connection.statement(this.grammar.compileDropAllViews(views));
  }

}
