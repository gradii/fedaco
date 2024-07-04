/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { isString } from '@gradii/nanofn';
import { intersection } from 'ramda';
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
    let schema;
    [schema, table] = await this.parseSchemaAndTable(table);

    table = this.connection.getTablePrefix() + table;

    for (const value of await this.getTables()) {
      if (table.toLowerCase() === value['name']
        && schema.toLowerCase() === value['schema']) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determine if the given view exists.
   *
   * @param  string  $view
   * @return bool
   */
  public async hasView(view: string) {
    let schema;
    [schema, view] = await this.parseSchemaAndTable(view);

    view = this.connection.getTablePrefix() + view;

    for (const value of await this.getViews()) {
      if (view.toLowerCase() === value['name']
        && schema.toLowerCase() === value['schema']) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get the user-defined types that belong to the database.
   *
   * @return array
   */
  public async getTypes() {
    return this.connection.getPostProcessor().processTypes(
      await this.connection.selectFromWriteConnection(this.grammar.compileTypes())
    );
  }

  /*Drop all tables from the database.*/
  public async dropAllTables() {
    const tables         = [];
    const excludedTables = this.connection.getConfig('dont_drop') ?? ['spatial_ref_sys'];
    const schemas        = this.grammar.escapeNames(await this.getSchemas());

    const result = await this.getTables();
    for (const table of result) {
      const qualifiedName = table['schema'] + '.' + table['name'];

      if (
        intersection(this.grammar.escapeNames([table['name'], qualifiedName]), excludedTables).length === 0 &&
        !schemas.includes(this.grammar.escapeNames([table['schema']])[0])
      ) {
        tables.push(qualifiedName);
      }
    }
    if (!tables.length) {
      return;
    }
    await this.connection.statement(this.grammar.compileDropAllTables(tables));
  }

  /*Drop all views from the database.*/
  public async dropAllViews() {
    const views   = [];
    const schemas = this.grammar.escapeNames(await this.getSchemas());
    for (const view of await this.getViews()) {
      if (schemas.includes(this.grammar.escapeNames([view['schema']])[0])) {
        views.push(view['scheme'] + '.' + view['name']);
      }
    }
    if (!views.length) {
      return;
    }
    await this.connection.statement(this.grammar.compileDropAllViews(views));
  }

  /*Drop all types from the database.*/
  public async dropAllTypes() {
    const types   = [];
    const domains = [];
    const schemas = this.grammar.escapeNames(await this.getSchemas());
    const result  = await this.getTypes();
    for (const type of result) {
      if (!type['implicit'] && schemas.includes(this.grammar.escapeNames([type['schema']])[0])) {
        if (type['type'] === 'domain') {
          domains.push(type['schema'] + '.' + type['name']);
        } else {
          types.push(type['schema'] + '.' + type['name']);
        }
      }
    }
    if (!types.length) {
      await this.connection.statement(this.grammar.compileDropAllTypes(types));
    }
    if (!domains.length) {
      await this.connection.statement(this.grammar.compileDropAllTypes(types));
    }
  }

  /**
   * Get the columns for a given table.
   *
   * @param table
   * @return array
   */
  public async getColumns(table: string) {
    let schema;
    [schema, table] = await this.parseSchemaAndTable(table);

    table = this.connection.getTablePrefix() + table;

    const results = await this.connection.selectFromWriteConnection(
      this.grammar.compileColumns(schema, table)
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
    let schema;
    [schema, table] = await this.parseSchemaAndTable(table);

    table = this.connection.getTablePrefix() + table;

    return this.connection.getPostProcessor().processIndexes(
      await this.connection.selectFromWriteConnection(this.grammar.compileIndexes(schema, table))
    );
  }

  /**
   * Get the foreign keys for a given table.
   *
   * @param table
   * @return array
   */
  public async getForeignKeys(table: string) {
    let schema;
    [schema, table] = await this.parseSchemaAndTable(table);

    table = this.connection.getTablePrefix() + table;

    return this.connection.getPostProcessor().processForeignKeys(
      await this.connection.selectFromWriteConnection(this.grammar.compileForeignKeys(schema, table))
    );
  }

  /**
   * Get the schemas for the connection.
   *
   * @return array
   */
  protected async getSchemas(): Promise<string[]> {
    const search_path = this.connection.getConfig('search_path');
    const schema      = this.connection.getConfig('schema');
    return this.parseSearchPath(
      search_path ? search_path :
        schema ? schema : 'public'
    );
  }

  /*Parse the database object reference and extract the database, schema, and table.*/
  protected async parseSchemaAndTable(reference: string) {
    const parts = reference.split('.');
    let database;
    if (parts.length > 2) {
      database = parts[0];

      throw new Error(
        'InvalidArgumentException Using three-part reference is not supported, you may use `Schema::connection(\'$database\')` instead.');
    }
    let schema = (await this.getSchemas())[0];

    if (parts.length === 2) {
      schema = parts[0];
      parts.shift();
    }

    return [schema, parts[0]];
  }

  /*Parse the "search_path" value into an array.*/
  protected parseSearchPath(searchPath: string | any[]) {
    return this._baseParseSearchPath(searchPath).map(schema => {
      return schema === '$user' ?
        this.connection.getConfig('username') :
        schema;
    });
  }

  protected _baseParseSearchPath(searchPath: string | string[]): string[] {
    if (isString(searchPath)) {
      const matches = /[^s,"']+/.exec(searchPath);
      searchPath    = matches[0];
    }

    return (searchPath as string[] || []).map(schema => {
      return schema.replace(/['|"]/g, '');
    });
  }
}
