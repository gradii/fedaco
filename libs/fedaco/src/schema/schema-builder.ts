/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { isBlank, pluck, tap } from '@gradii/nanofn';
import type { Connection } from '../connection';
import { Blueprint } from './blueprint';
import type { SchemaGrammar } from './grammar/schema-grammar';

export class SchemaBuilder {
  /* The database connection instance. */
  protected connection: Connection;
  /* The schema grammar instance. */
  protected grammar: SchemaGrammar;
  /* The Blueprint resolver callback. */
  protected resolver: (...args: any[]) => any;
  /* The default string length for migrations. */
  public static _defaultStringLength = 255;
  /* The default relationship morph key type. */
  public static _defaultMorphKeyType = 'int';

  /* Create a new database Schema manager. */
  public constructor(connection: Connection) {
    this.connection = connection;
    this.grammar = connection.getSchemaGrammar();
  }

  /* Set the default string length for migrations. */
  public static defaultStringLength(length: number) {
    this._defaultStringLength = length;
  }

  /* Set the default morph key type for migrations. */
  public static defaultMorphKeyType(type: string) {
    if (!['int', 'uuid'].includes(type)) {
      throw new Error(`InvalidArgumentException Morph key type must be 'int' or 'uuid'.`);
    }
    this._defaultMorphKeyType = type;
  }

  /* Set the default morph key type for migrations to UUIDs. */
  public static morphUsingUuids() {
    return this.defaultMorphKeyType('uuid');
  }

  /* Create a database in the schema. */
  public createDatabase(name: string) {
    throw new Error('LogicException This database driver does not support creating databases.');
  }

  /* Drop a database from the schema if the database exists. */
  public dropDatabaseIfExists(name: string) {
    throw new Error('LogicException This database driver does not support dropping databases.');
  }

  /* Determine if the given table exists. */
  public async hasTable(table: string) {
    table = this.connection.getTablePrefix() + table;

    for (const value of await this.getTables(false)) {
      if (table.toLowerCase() === value['name']) {
        return true;
      }
    }

    return false;
  }

  public async hasView(view: string) {
    view = this.connection.getTablePrefix() + view;

    for (const value of await this.getViews()) {
      if (view.toLowerCase() === value['name']) {
        return true;
      }
    }

    return false;
  }

  public async getTables(withSize = true) {
    return this.connection
      .getPostProcessor()
      .processTables(await this.connection.selectFromWriteConnection(this.grammar.compileTables()));
  }

  public async getTableListing() {
    return (await this.getTables()).map((it: any) => it['name']);
  }

  public async getViews(): Promise<any[]> {
    return this.connection
      .getPostProcessor()
      .processViews(await this.connection.selectFromWriteConnection(this.grammar.compileViews()));
  }

  public getTypes() {
    throw new Error('LogicException This database driver does not support user-defined types.');
  }

  /* Determine if the given table has a given column. */
  public async hasColumn(table: string, column: string) {
    const result = await this.getColumnListing(table);
    return result.map((it) => it.toLowerCase()).includes(column.toLowerCase());
  }

  /* Determine if the given table has given columns. */
  public async hasColumns(table: string, columns: any[]) {
    const result = await this.getColumnListing(table);
    const tableColumns = result.map((it) => it.toLowerCase());
    for (const column of columns) {
      if (!tableColumns.includes(column.toLowerCase())) {
        return false;
      }
    }
    return true;
  }

  /**
   * Execute a table builder callback if the given table has a given column.
   *
   * @param    table
   * @param    column
   * @param    callback
   * @return void
   */
  public async whenTableHasColumn(table: string, column: string, callback: (...args: any[]) => any) {
    if (await this.hasColumn(table, column)) {
      await this.table(table, (table: Blueprint) => callback(table));
    }
  }

  /**
   * Execute a table builder callback if the given table doesn't have a given column.
   *
   * @param  string  $table
   * @param  string  $column
   * @param  \Closure  $callback
   * @return void
   */
  public async whenTableDoesntHaveColumn(table: string, column: string, callback: (...args: any[]) => any) {
    if (!(await this.hasColumn(table, column))) {
      this.table(table, (table: Blueprint) => callback(table));
    }
  }

  /**
   * Get the data type for the given column name.
   *
   * @param  string  $table
   * @param  string  $column
   * @param  bool  $fullDefinition
   * @return string
   */
  public async getColumnType(table: string, column: string, fullDefinition = false) {
    const columns = await this.getColumns(table);
    for (const value of columns) {
      if (value['name'].toLowerCase() === column.toLowerCase()) {
        return fullDefinition ? value['type'] : value['type_name'];
      }
    }

    throw new Error("InvalidArgumentException There is no column with name '$column' on table '$table'.");
  }

  /**
   * Get the column listing for a given table.
   */
  public async getColumnListing(table: string): Promise<string[]> {
    return pluck('name', await this.getColumns(table));
  }

  public async getColumns(table: string): Promise<any[]> {
    table = this.connection.getTablePrefix() + table;
    return this.connection
      .getPostProcessor()
      .processColumns(await this.connection.selectFromWriteConnection(this.grammar.compileColumns(table)));
  }

  public async getIndexes(table: string): Promise<any[]> {
    table = this.connection.getTablePrefix() + table;

    return this.connection
      .getPostProcessor()
      .processIndexes(await this.connection.selectFromWriteConnection(this.grammar.compileIndexes(table)));
  }

  public async getIndexListing(table: string): Promise<any[]> {
    return pluck('name', await this.getIndexes(table));
  }

  public async hasIndex(table: string, index: string | string[], type?: string): Promise<boolean> {
    type = isBlank(type) ? type : type.toLowerCase();
    for (const value of await this.getIndexes(table)) {
      const typeMatches =
        isBlank(value) ||
        (type === 'primary' && value['primary']) ||
        (type === 'unique' && value['unique']) ||
        type === value['type'];

      if (value['name'] === index || (value['column'] === index && typeMatches)) {
        return true;
      }
    }
    return false;
  }

  public async getForeignKeys(table: string) {
    table = this.connection.getTablePrefix() + table;

    return this.connection
      .getPostProcessor()
      .processForeignKeys(await this.connection.selectFromWriteConnection(this.grammar.compileForeignKeys(table)));
  }

  /* Modify a table on the schema. */
  public async table(table: string, callback: (bp: Blueprint) => void) {
    await this.build(this.createBlueprint(table, callback));
  }

  /* Create a new table on the schema. */
  public async create(table: string, callback: (table: Blueprint) => void) {
    await this.build(
      tap((blueprint) => {
        blueprint.create();
        callback(blueprint);
      }, this.createBlueprint(table)),
    );
  }

  /* Drop a table from the schema. */
  public async drop(table: string) {
    await this.build(
      tap((blueprint) => {
        blueprint.drop();
      }, this.createBlueprint(table)),
    );
  }

  /* Drop a table from the schema if it exists. */
  public async dropIfExists(table: string) {
    await this.build(
      tap((blueprint) => {
        blueprint.dropIfExists();
      }, this.createBlueprint(table)),
    );
  }

  /* Drop columns from a table schema. */
  public async dropColumns(table: string, columns: string | any[]) {
    await this.table(table, (blueprint: Blueprint) => {
      blueprint.dropColumn(columns);
    });
  }

  /* Drop all tables from the database. */
  public dropAllTables(): Promise<void> {
    throw new Error('LogicException This database driver does not support dropping all tables.');
  }

  /* Drop all views from the database. */
  public dropAllViews(): Promise<void> {
    throw new Error('LogicException This database driver does not support dropping all views.');
  }

  /* Drop all types from the database. */
  public dropAllTypes(): Promise<void> {
    throw new Error('LogicException This database driver does not support dropping all types.');
  }

  /* Rename a table on the schema. */
  public async rename(from: string, to: string): Promise<void> {
    await this.build(
      tap((blueprint: Blueprint) => {
        blueprint.rename(to);
      }, this.createBlueprint(from)),
    );
  }

  /* Enable foreign key constraints. */
  public async enableForeignKeyConstraints() {
    return this.connection.statement(this.grammar.compileEnableForeignKeyConstraints());
  }

  /* Disable foreign key constraints. */
  public async disableForeignKeyConstraints() {
    return this.connection.statement(this.grammar.compileDisableForeignKeyConstraints());
  }

  /**
   * Disable foreign key constraints during the execution of a callback.
   *
   * @param  \Closure  $callback
   * @return mixed
   */
  public async withoutForeignKeyConstraints(callback: (...args: any[]) => void) {
    await this.disableForeignKeyConstraints();

    try {
      return callback();
    } finally {
      await this.enableForeignKeyConstraints();
    }
  }

  /* Execute the blueprint to build / modify the table. */
  protected async build(blueprint: Blueprint) {
    await blueprint.build(this.connection, this.grammar);
  }

  /* Create a new command set with a Closure. */
  protected createBlueprint(table: string, callback: (...args: any[]) => any | null = null) {
    const prefix = this.connection.getConfig('prefix_indexes') ? this.connection.getConfig('prefix') : '';
    if (this.resolver !== undefined) {
      return this.resolver(table, callback, prefix);
    }
    return new Blueprint(table, callback, prefix);
  }

  /* Get the database connection instance. */
  public getConnection() {
    return this.connection;
  }

  /* Set the database connection instance. */
  public setConnection(connection: Connection) {
    this.connection = connection;
    return this;
  }

  /* Set the Schema Blueprint resolver callback. */
  public blueprintResolver(resolver: (...args: any[]) => any) {
    this.resolver = resolver;
  }
}
