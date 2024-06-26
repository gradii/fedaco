/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SchemaBuilder } from '../schema-builder';

export class PostgresSchemaBuilder extends SchemaBuilder {
  /*Create a database in the schema.*/
  public createDatabase(name: string) {
    return this.connection.statement(this.grammar.compileCreateDatabase(name, this.connection));
  }

  /*Drop a database from the schema if the database exists.*/
  public dropDatabaseIfExists(name: string) {
    return this.connection.statement(this.grammar.compileDropDatabaseIfExists(name));
  }

  /*Determine if the given table exists.*/
  public async hasTable(table: string) {
    let database, schema;
    [database, schema, table] = this.parseSchemaAndTable(table);
    table                     = this.connection.getTablePrefix() + table;
    const result              = await this.connection.select(
      this.grammar.compileTableExists(),
      [database, schema, table]);
    return result.length > 0;
  }

  /*Drop all tables from the database.*/
  public async dropAllTables() {
    const tables         = [];
    const excludedTables = this.connection.getConfig('dont_drop') ?? ['spatial_ref_sys'];
    const result         = await this.getAllTables();
    for (const row of result) {
      const table = row;
      if (!excludedTables.includes(table)) {
        tables.push(table);
      }
    }
    if (!tables.length) {
      return;
    }
    await this.connection.statement(this.grammar.compileDropAllTables(tables));
  }

  /*Drop all views from the database.*/
  public async dropAllViews() {
    const views  = [];
    const result = await this.getAllViews();
    for (const row of result) {
      // row = /*cast type array*/ row;
      views.push(row);
    }
    if (!views.length) {
      return;
    }
    await this.connection.statement(this.grammar.compileDropAllViews(views));
  }

  /*Drop all types from the database.*/
  public async dropAllTypes() {
    const types  = [];
    const result = await this.getAllTypes();
    for (const row of result) {
      // const row = /*cast type array*/ row;
      types.push(row);
    }
    if (!types.length) {
      return;
    }
    await this.connection.statement(this.grammar.compileDropAllTypes(types));
  }

  /*Get all of the table names for the database.*/
  public getAllTables() {
    return this.connection.select(this.grammar.compileGetAllTables(
      this.parseSearchPath(this.connection.getConfig('search_path'))));
  }

  /*Get all of the view names for the database.*/
  public getAllViews() {
    return this.connection.select(this.grammar.compileGetAllViews(
      this.parseSearchPath(this.connection.getConfig('search_path'))));
  }

  /*Get all of the type names for the database.*/
  public getAllTypes() {
    return this.connection.select(this.grammar.compileGetAllTypes());
  }

  /*Get the column listing for a given table.*/
  public async getColumnListing(table: string) {
    let database, schema;
    [database, schema, table] = this.parseSchemaAndTable(table);
    table                     = this.connection.getTablePrefix() + table;
    const results             = await this.connection.select(this.grammar.compileColumnListing(),
      [database, schema, table]);
    return this.connection.getPostProcessor().processColumnListing(results);
  }

  /*Parse the database object reference and extract the database, schema, and table.*/
  protected parseSchemaAndTable(reference: string) {
    const searchPath = this.parseSearchPath(this.connection.getConfig('search_path') || 'public');
    const parts      = reference.split('.');
    let database     = this.connection.getConfig('database');
    if (parts.length === 3) {
      database = parts[0];
      parts.shift();
    }
    let schema = searchPath[0] === 'User' ? this.connection.getConfig(
      'username') : searchPath[0];
    if (parts.length === 2) {
      schema = parts[0];
      parts.shift();
    }
    return [database, schema, parts[0]];
  }

  /*Parse the "search_path" value into an array.*/
  protected parseSearchPath(searchPath: string | any[]) {
    // todo
    // if (isString(searchPath)) {
    //   preg_match_all(/[a-zA-z0-9$]{1,}/i, searchPath, );
    //   const searchPath = matches[0];
    // }
    // array_walk(searchPath, schema => {
    //   let schema   = trim(schema, '\'"');
    //   const schema = schema === 'User' ? this.connection.getConfig('username') : schema;
    // });
    return searchPath;
  }
}
