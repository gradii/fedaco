/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { isObject } from '@gradii/nanofn';
import { intersection, tap } from 'ramda';
import type { Connection } from '../connection';
import { DbalTable } from '../dbal/dbal-table';
import { wrap } from '../helper/arr';
import { Blueprint } from './blueprint';
import type { SchemaGrammar } from './grammar/schema-grammar';

export class SchemaBuilder {
  /*The database connection instance.*/
  protected connection: Connection;
  /*The schema grammar instance.*/
  protected grammar: SchemaGrammar;
  /*The Blueprint resolver callback.*/
  protected resolver: Function;
  /*The default string length for migrations.*/
  public static _defaultStringLength = 255;
  /*The default relationship morph key type.*/
  public static _defaultMorphKeyType = 'int';

  /*Create a new database Schema manager.*/
  public constructor(connection: Connection) {
    this.connection = connection;
    this.grammar    = connection.getSchemaGrammar();
  }

  /*Set the default string length for migrations.*/
  public static defaultStringLength(length: number) {
    this._defaultStringLength = length;
  }

  /*Set the default morph key type for migrations.*/
  public static defaultMorphKeyType(type: string) {
    if (!['int', 'uuid'].includes(type)) {
      throw new Error(`InvalidArgumentException Morph key type must be 'int' or 'uuid'.`);
    }
    this._defaultMorphKeyType = type;
  }

  /*Set the default morph key type for migrations to UUIDs.*/
  public static morphUsingUuids() {
    return this.defaultMorphKeyType('uuid');
  }

  /*Create a database in the schema.*/
  public createDatabase(name: string) {
    throw new Error('LogicException This database driver does not support creating databases.');
  }

  /*Drop a database from the schema if the database exists.*/
  public dropDatabaseIfExists(name: string) {
    throw new Error('LogicException This database driver does not support dropping databases.');
  }

  /*Determine if the given table exists.*/
  public async hasTable(table: string) {
    table        = this.connection.getTablePrefix() + table;
    const result = await this.connection.selectFromWriteConnection(
      this.grammar.compileTableExists(), [table]
    );
    return result.length > 0;
  }

  /*Determine if the given table has a given column.*/
  public async hasColumn(table: string, column: string) {
    const result = await this.getColumnListing(table);
    return result.map(it => it.toLowerCase()).includes(column.toLowerCase());
  }

  /*Determine if the given table has given columns.*/
  public async hasColumns(table: string, columns: any[]) {
    const result       = await this.getColumnListing(table);
    const tableColumns = result.map(it => it.toLowerCase());
    for (const column of columns) {
      if (!tableColumns.includes(column.toLowerCase())) {
        return false;
      }
    }
    return true;
  }

  /*Get the data type for the given column name.*/
  public async getColumnType(table: string, column: string) {
    // table        = this.connection.getTablePrefix() + table;
    // const result = await this.connection.getDoctrineColumn(table, column);
    // return result.getType().getName();
  }

  /*Get the column listing for a given table.*/
  public async getColumnListing(table: string): Promise<string[]> {
    const results = await this.connection.selectFromWriteConnection(
      this.grammar.compileColumnListing(this.connection.getTablePrefix() + table)
    );
    return this.connection.getPostProcessor().processColumnListing(results);
  }

  public async getColumns(table: string, columns: string[]): Promise<string[]> {
    table = this.connection.getTablePrefix() + table;
    return this.connection.getPostProcessor().processColumns(
      await this.connection.selectFromWriteConnection(this.grammar.compileColumns(table))
    )
  }

  /*Modify a table on the schema.*/
  public async table(table: string, callback: (bp: Blueprint) => void) {
    await this.build(this.createBlueprint(table, callback));
  }

  /*Create a new table on the schema.*/
  public async create(table: string, callback: (table: Blueprint) => void) {
    await this.build(tap(blueprint => {
      blueprint.create();
      callback(blueprint);
    }, this.createBlueprint(table)));
  }

  /*Drop a table from the schema.*/
  public async drop(table: string) {
    await this.build(tap(blueprint => {
      blueprint.drop();
    }, this.createBlueprint(table)));
  }

  /*Drop a table from the schema if it exists.*/
  public async dropIfExists(table: string) {
    await this.build(tap(blueprint => {
      blueprint.dropIfExists();
    }, this.createBlueprint(table)));
  }

  /*Drop columns from a table schema.*/
  public async dropColumns(table: string, columns: string | any[]) {
    await this.table(table, (blueprint: Blueprint) => {
      blueprint.dropColumn(columns);
    });
  }

  /*Drop all tables from the database.*/
  public dropAllTables() {
    throw new Error('LogicException This database driver does not support dropping all tables.');
  }

  /*Drop all views from the database.*/
  public dropAllViews() {
    throw new Error('LogicException This database driver does not support dropping all views.');
  }

  /*Drop all types from the database.*/
  public dropAllTypes() {
    throw new Error('LogicException This database driver does not support dropping all types.');
  }

  /*Get all of the table names for the database.*/
  public getAllTables() {
    throw new Error('LogicException This database driver does not support getting all tables.');
  }

  /*Rename a table on the schema.*/
  public rename(from: string, to: string) {
    this.build(
      tap((blueprint: Blueprint) => {
        blueprint.rename(to);
      }, this.createBlueprint(from))
    );
  }

  /*Enable foreign key constraints.*/
  public async enableForeignKeyConstraints() {
    return this.connection.statement(this.grammar.compileEnableForeignKeyConstraints());
  }

  /*Disable foreign key constraints.*/
  public async disableForeignKeyConstraints() {
    return this.connection.statement(this.grammar.compileDisableForeignKeyConstraints());
  }

  /*Execute the blueprint to build / modify the table.*/
  protected async build(blueprint: Blueprint) {
    await blueprint.build(this.connection, this.grammar);
  }

  //region database info
  /*Methods for filtering return values of list*() methods to convert
      the native DBMS data definition to a portable Doctrine definition*/

  /**/
  protected _getPortableDatabasesList(databases: any[]) {
    const list = [];
    for (let value of databases) {
      value = this._getPortableDatabaseDefinition(value);
      if (!value) {
        continue;
      }
      list.push(value);
    }
    return list;
  }

  /*Converts a list of namespace names from the native DBMS data definition to a portable Doctrine definition.*/
  protected getPortableNamespacesList(namespaces: string[]) {
    const namespacesList = [];
    for (const namespace of namespaces) {
      namespacesList.push(this.getPortableNamespaceDefinition(namespace));
    }
    return namespacesList;
  }

  /**/
  protected _getPortableDatabaseDefinition(database: any) {
    return database;
  }

  /*Converts a namespace definition from the native DBMS data definition to a portable Doctrine definition.*/
  protected getPortableNamespaceDefinition(namespace: string) {
    return namespace;
  }

  /**/
  protected _getPortableFunctionsList(functions: any[][]) {
    const list = [];
    for (let value of functions) {
      value = this._getPortableFunctionDefinition(value);
      if (!value) {
        continue;
      }
      list.push(value);
    }
    return list;
  }

  /**/
  protected _getPortableFunctionDefinition(func: any[]) {
    return func;
  }

  /**/
  protected _getPortableTriggersList(triggers: any[][]) {
    const list = [];
    for (let value of triggers) {
      value = this._getPortableTriggerDefinition(value);
      if (!value) {
        continue;
      }
      list.push(value);
    }
    return list;
  }

  /**/
  protected _getPortableTriggerDefinition(trigger: any[]) {
    return trigger;
  }

  /**/
  protected _getPortableSequencesList(sequences: any[][]) {
    const list = [];
    for (const value of sequences) {
      list.push(this._getPortableSequenceDefinition(value));
    }
    return list;
  }

  /**/
  protected _getPortableSequenceDefinition(sequence: any[]) {
    throw new Error('notSupported Sequences');
  }

  /*Independent of the database the keys of the column list result are lowercased.

  The name of the created column instance however is kept in its case.*/
  protected _getPortableTableColumnList(table: string, database: string, tableColumns: any[][]) {
    // var eventManager = this.grammar.getEventManager();
    const list = [];
    for (const tableColumn of tableColumns) {
      let column = null;
      // let defaultPrevented = false;
      // if (eventManager !== null && eventManager.hasListeners(Events.onSchemaColumnDefinition)) {
      //   var eventArgs = new SchemaColumnDefinitionEventArgs(tableColumn, table, database, this._conn);
      //   eventManager.dispatchEvent(Events.onSchemaColumnDefinition, eventArgs);
      //   defaultPrevented = eventArgs.isDefaultPrevented();
      //   column = eventArgs.getColumn();
      // }
      // if (!defaultPrevented) {
      column = this._getPortableTableColumnDefinition(tableColumn);
      // }
      if (!column) {
        continue;
      }
      const name = column.getQuotedName(this.grammar).toLowerCase();
      list[name] = column;
    }
    return list;
  }

  /*Gets Table Column Definition.*/
  protected _getPortableTableColumnDefinition(tableColumn: any): any {
    throw new Error('not implement');
  }

  /*Aggregates and groups the index results according to the required data result.*/
  protected _getPortableTableIndexesList(tableIndexRows: any[], tableName: string | null = null) {
    const result = [];
    for (const tableIndex of tableIndexRows) {
      let keyName;
      const indexName = keyName = tableIndex['key_name'];
      if (tableIndex['primary']) {
        keyName = 'primary';
      }
      keyName = keyName.toLowerCase();
      if (!(result[keyName] !== undefined)) {
        const options: Record<string, any> = {
          'lengths': []
        };
        if (tableIndex['where'] !== undefined) {
          options['where'] = tableIndex['where'];
        }
        result[keyName] = {
          'name'   : indexName,
          'columns': [],
          'unique' : !tableIndex['non_unique'],
          'primary': tableIndex['primary'],
          'flags'  : tableIndex['flags'] ?? [],
          'options': options
        };
      }
      result[keyName]['columns'].push(tableIndex['column_name']);
      result[keyName]['options']['lengths'].push(tableIndex['length'] ?? null);
    }
    // const eventManager = this.grammar.getEventManager();
    const indexes: Record<string, any> = {};
    for (const [indexKey, data] of Object.entries(result)) {
      let index = null;
      // var defaultPrevented = false;
      // if (eventManager !== null && eventManager.hasListeners(Events.onSchemaIndexDefinition)) {
      //   var eventArgs = new SchemaIndexDefinitionEventArgs(data, tableName, this._conn);
      //   eventManager.dispatchEvent(Events.onSchemaIndexDefinition, eventArgs);
      //   var defaultPrevented = eventArgs.isDefaultPrevented();
      //   var index            = eventArgs.getIndex();
      // }
      // if (!defaultPrevented) {
      index = {
        name   : data['name'],
        columns: data['columns'],
        unique : data['unique'],
        primary: data['primary'],
        flags  : data['flags'],
        options: data['options']
      };
      // }
      if (!index) {
        continue;
      }
      indexes[indexKey] = index;
    }
    return indexes;
  }

  /**/
  protected _getPortableTablesList(tables: any[]) {
    const list = [];
    for (let value of tables) {
      value = this._getPortableTableDefinition(value);
      if (!value) {
        continue;
      }
      list.push(value);
    }
    return list;
  }

  /**/
  protected _getPortableTableDefinition(table: any) {
    if (isObject(table)) {
      return table['name'];
    }
    return table;
  }

  /**/
  protected _getPortableUsersList(users: any[][]) {
    const list = [];
    for (let value of users) {
      value = this._getPortableUserDefinition(value);
      if (!value) {
        continue;
      }
      list.push(value);
    }
    return list;
  }

  /**/
  protected _getPortableUserDefinition(user: string[]) {
    return user;
  }

  /**/
  // protected _getPortableViewsList(views: any[][]) {
  //   const list = [];
  //   for (const value of views) {
  //     const view = this._getPortableViewDefinition(value);
  //     if (!view) {
  //       continue;
  //     }
  //     const viewName   = view.getQuotedName(this.grammar).toLowerCase();
  //     list[viewName] = view;
  //   }
  //   return list;
  // }

  /**/
  protected _getPortableViewDefinition(view: any[]) {
    return false;
  }

  /*Lists the available databases for this connection.*/
  public async listDatabases() {
    const sql       = this.grammar.getListDatabasesSQL();
    const databases = await this.connection.select(sql);
    return this._getPortableDatabasesList(databases);
  }

  /*Returns a list of all namespaces in the current database.*/
  public async listNamespaceNames() {
    const sql        = this.grammar.getListNamespacesSQL();
    const namespaces = await this.connection.select(sql);
    return this.getPortableNamespacesList(namespaces);
  }

  /*Lists the available sequences for this connection.*/
  public async listSequences(database: string | null = null) {
    if (database === null) {
      database = this.connection.getDatabaseName();
    }
    const sql       = this.grammar.getListSequencesSQL(database);
    const sequences = await this.connection.select(sql);
    return this.filterAssetNames(this._getPortableSequencesList(sequences));
  }

  /*Lists the columns for a given table.
  In contrast to other libraries and to the old version of Doctrine,
  this column definition does try to contain the 'primary' field for
  the reason that it is not portable across different RDBMS. Use
  {@see listTableIndexes($tableName)} to retrieve the primary key
  of a table. Where a RDBMS specifies more details, these are held
  in the platformDetails array.*/
  public async listTableColumns(table: string, database?: string) {
    if (!database) {
      database = this.connection.getDatabaseName();
    }
    const sql          = this.grammar.getListTableColumnsSQL(table, database);
    const tableColumns = await this.connection.select(sql);
    return this._getPortableTableColumnList(table, database, tableColumns);
  }

  /*Lists the indexes for a given table returning an array of Index instances.

  Keys of the portable indexes list are all lower-cased.*/
  public async listTableIndexes(table: string): Promise<Record<string, any>> {
    const sql          = this.grammar.getListTableIndexesSQL(table,
      this.connection.getDatabaseName());
    const tableIndexes = await this.connection.select(sql);
    return this._getPortableTableIndexesList(tableIndexes, table);
  }

  /*Returns true if all the given tables exist.

  The usage of a string $tableNames is deprecated. Pass a one-element array instead.*/
  public async tablesExist(tableNames: string | string[]) {
    tableNames = wrap(tableNames).map(it => it.toLowerCase());
    return tableNames.length === intersection(
      tableNames,
      (await this.listTableNames()).map(it => it.toLowerCase())
    ).length;
  }

  /*Returns a list of all tables in the current database.*/
  public async listTableNames() {
    const sql        = this.grammar.getListTablesSQL();
    const tables     = await this.connection.select(sql);
    const tableNames = this._getPortableTablesList(tables);
    return this.filterAssetNames(tableNames);
  }

  /*Filters asset names if they are configured to return only a subset of all
  the found elements.*/
  protected filterAssetNames(assetNames: any[]) {
    // todo getSchemaAssetsFilter function
    const filter = this.connection.getConfig().schemaAssetsFilter;
    if (!filter) {
      return assetNames;
    }
    return assetNames.filter(filter);
  }

  /**/
  protected getFilterSchemaAssetsExpression() {
    // todo getFilterSchemaAssetsExpression function
    return this.connection.getConfig().filterSchemaAssetsExpression;
  }

  /*Lists the tables for this connection.*/
  public async listTables() {
    const tableNames = await this.listTableNames();
    const tables     = [];
    for (const tableName of tableNames) {
      tables.push(this.listTableDetails(tableName));
    }
    return tables;
  }

  public async listTableDetails(tableName: string): Promise<DbalTable> {
    const columns   = await this.listTableColumns(tableName);
    let foreignKeys = [];
    if (this.grammar.supportsForeignKeyConstraints()) {
      foreignKeys = await this.listTableForeignKeys(tableName);
    }
    const indexes = await this.listTableIndexes(tableName);
    return new DbalTable(tableName, columns, indexes, foreignKeys);
  }

  /*Lists the foreign keys for the given table.*/
  public async listTableForeignKeys(table: string, database: string | null = null) {
    if (database === null) {
      database = this.connection.getDatabaseName();
    }
    const sql              = this.grammar.getListTableForeignKeysSQL(table, database);
    const tableForeignKeys = await this.connection.select(sql);
    return this._getPortableTableForeignKeysList(tableForeignKeys);
  }

  protected _getPortableTableForeignKeysList(tableForeignKeys: any[][]) {
    const list = [];
    for (const value of tableForeignKeys) {
      list.push(this._getPortableTableForeignKeyDefinition(value));
    }
    return list;
  }

  protected _getPortableTableForeignKeyDefinition(tableForeignKey: any) {
    return tableForeignKey;
  }

  //endregion

  /*Create a new command set with a Closure.*/
  protected createBlueprint(table: string, callback: Function | null = null) {
    const prefix = this.connection.getConfig('prefix_indexes') ?
      this.connection.getConfig('prefix') : '';
    if (this.resolver !== undefined) {
      return this.resolver(table, callback, prefix);
    }
    return new Blueprint(table, callback, prefix);
  }

  /*Register a custom Doctrine mapping type.*/
  public registerCustomDoctrineType(clazz: string, name: string, type: string) {
    // if (!this.connection.isDoctrineAvailable()) {
    //   throw new Error(
    //     'RuntimeException Registering a custom Doctrine type requires Doctrine DBAL (doctrine/dbal).');
    // }
    // if (!Type.hasType(name)) {
    //   Type.addType(name, clazz);
    //   this.connection.getDoctrineSchemaManager().getDatabasePlatform().registerDoctrineTypeMapping(
    //     type, name);
    // }
  }

  /*Get the database connection instance.*/
  public getConnection() {
    return this.connection;
  }

  /*Set the database connection instance.*/
  public setConnection(connection: Connection) {
    this.connection = connection;
    return this;
  }

  /*Set the Schema Blueprint resolver callback.*/
  public blueprintResolver(resolver: Function) {
    this.resolver = resolver;
  }

  public async getIndexes(table: string) {
    table = this.connection.getTablePrefix() + table;

    return this.connection.getPostProcessor().processIndexes(
      await this.connection.selectFromWriteConnection(this.grammar.compileIndexes(table))
    );
  }
}
