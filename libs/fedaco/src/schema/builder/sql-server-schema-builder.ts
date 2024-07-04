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

  /**
   * Determine if the given table exists.
   *
   * @param table
   * @return bool
   */
  public async hasTable(table: string) {
    let schema;
    [schema, table] = this.parseSchemaAndTable(table);

    schema ??= await this.getDefaultSchema();
    table = this.connection.getTablePrefix() + table;

    for (const value of await this.getTables()) {
      if (table.toLowerCase() === value['name'] &&
        schema.toLowerCase() === value['schema']) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determine if the given view exists.
   *
   * @param view
   * @return bool
   */
  public async hasView(view: string) {
    let schema;
    [schema, view] = this.parseSchemaAndTable(view);

    schema ??= await this.getDefaultSchema();
    view = this.connection.getTablePrefix() + view;

    for (const value of await this.getViews()) {
      if (view.toLowerCase() === value['name'] &&
        schema.toLowerCase() === value['schema']) {
        return true;
      }
    }

    return false;
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

  /**
   * Get the columns for a given table.
   *
   * @param   table
   * @return array
   */
  public async getColumns(table: string) {
    let schema;
    [schema, table] = this.parseSchemaAndTable(table);

    table = this.connection.getTablePrefix() + table;

    const results = await this.connection.selectFromWriteConnection(
      this.grammar.compileColumns(schema, table)
    );

    return this.connection.getPostProcessor().processColumns(results);
  }

  /**
   * Get the indexes for a given table.
   *
   * @param   table
   * @return array
   */
  public async getIndexes(table: string) {
    let schema;
    [schema, table] = this.parseSchemaAndTable(table);

    table = this.connection.getTablePrefix() + table;

    return this.connection.getPostProcessor().processIndexes(
      await this.connection.selectFromWriteConnection(this.grammar.compileIndexes(schema, table))
    );
  }

  /**
   * Get the foreign keys for a given table.
   *
   * @param  string  table
   * @return array
   */
  public async getForeignKeys(table: string) {
    let schema;
    [schema, table] = this.parseSchemaAndTable(table);

    table = this.connection.getTablePrefix() + table;

    return this.connection.getPostProcessor().processForeignKeys(
      await this.connection.selectFromWriteConnection(this.grammar.compileForeignKeys(schema, table))
    );
  }

  /**
   * Get the default schema for the connection.
   *
   * @return string
   */
  protected async getDefaultSchema() {
    return this.connection.scalar(this.grammar.compileDefaultSchema());
  }

  /**
   * Parse the database object reference and extract the schema and table.
   *
   * @param   reference
   * @return array
   */
  protected parseSchemaAndTable(reference: string): string[] {
    let parts = reference.split('.', 2);
    if (parts.length == 1) {
      parts = [null, parts[0]];
    }

    if (parts[1].includes('.')) {
      const database = parts[0];

      throw new Error(
        `InvalidArgumentException Using three-part reference is not supported, you may use \`Schema::connection('${database}')\` instead.`);
    }

    return parts;
  }
}
