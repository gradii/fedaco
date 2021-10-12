import { __awaiter } from 'tslib';

import { intersection, tap } from 'ramda';
import { Table } from '../dbal/table';
import { wrap } from '../helper/arr';
import { Blueprint } from './blueprint';

export class SchemaBuilder {

  constructor(connection) {
    this.connection = connection;
    this.grammar = connection.getSchemaGrammar();
  }

  static defaultStringLength(length) {
    this._defaultStringLength = length;
  }

  static defaultMorphKeyType(type) {
    if (!['int', 'uuid'].includes(type)) {
      throw new Error(`InvalidArgumentException Morph key type must be 'int' or 'uuid'.`);
    }
    this._defaultMorphKeyType = type;
  }

  static morphUsingUuids() {
    return this.defaultMorphKeyType('uuid');
  }

  createDatabase(name) {
    throw new Error('LogicException This database driver does not support creating databases.');
  }

  dropDatabaseIfExists(name) {
    throw new Error('LogicException This database driver does not support dropping databases.');
  }

  hasTable(table) {
    return __awaiter(this, void 0, void 0, function* () {
      table = this.connection.getTablePrefix() + table;
      const result = yield this.connection.selectFromWriteConnection(this.grammar.compileTableExists(), [table]);
      return result.length > 0;
    });
  }

  hasColumn(table, column) {
    return __awaiter(this, void 0, void 0, function* () {
      const result = yield this.getColumnListing(table);
      return result.map(it => it.toLowerCase()).includes(column.toLowerCase());
    });
  }

  hasColumns(table, columns) {
    return __awaiter(this, void 0, void 0, function* () {
      const result = yield this.getColumnListing(table);
      const tableColumns = result.map(it => it.toLowerCase());
      for (const column of columns) {
        if (!tableColumns.includes(column.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }

  getColumnType(table, column) {
    return __awaiter(this, void 0, void 0, function* () {


    });
  }

  getColumnListing(table) {
    return __awaiter(this, void 0, void 0, function* () {
      const results = yield this.connection.selectFromWriteConnection(this.grammar.compileColumnListing(this.connection.getTablePrefix() + table));
      return this.connection.getPostProcessor().processColumnListing(results);
    });
  }

  table(table, callback) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.build(this.createBlueprint(table, callback));
    });
  }

  create(table, callback) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.build(tap(blueprint => {
        blueprint.create();
        callback(blueprint);
      }, this.createBlueprint(table)));
    });
  }

  drop(table) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.build(tap(blueprint => {
        blueprint.drop();
      }, this.createBlueprint(table)));
    });
  }

  dropIfExists(table) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.build(tap(blueprint => {
        blueprint.dropIfExists();
      }, this.createBlueprint(table)));
    });
  }

  dropColumns(table, columns) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.table(table, (blueprint) => {
        blueprint.dropColumn(columns);
      });
    });
  }

  dropAllTables() {
    throw new Error('LogicException This database driver does not support dropping all tables.');
  }

  dropAllViews() {
    throw new Error('LogicException This database driver does not support dropping all views.');
  }

  dropAllTypes() {
    throw new Error('LogicException This database driver does not support dropping all types.');
  }

  getAllTables() {
    throw new Error('LogicException This database driver does not support getting all tables.');
  }

  rename(from, to) {
    this.build(tap((blueprint) => {
      blueprint.rename(to);
    }, this.createBlueprint(from)));
  }

  enableForeignKeyConstraints() {
    return __awaiter(this, void 0, void 0, function* () {
      return this.connection.statement(this.grammar.compileEnableForeignKeyConstraints());
    });
  }

  disableForeignKeyConstraints() {
    return __awaiter(this, void 0, void 0, function* () {
      return this.connection.statement(this.grammar.compileDisableForeignKeyConstraints());
    });
  }

  build(blueprint) {
    return __awaiter(this, void 0, void 0, function* () {
      yield blueprint.build(this.connection, this.grammar);
    });
  }


  _getPortableDatabasesList(databases) {
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

  getPortableNamespacesList(namespaces) {
    const namespacesList = [];
    for (const namespace of namespaces) {
      namespacesList.push(this.getPortableNamespaceDefinition(namespace));
    }
    return namespacesList;
  }

  _getPortableDatabaseDefinition(database) {
    return database;
  }

  getPortableNamespaceDefinition(namespace) {
    return namespace;
  }

  _getPortableFunctionsList(functions) {
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

  _getPortableFunctionDefinition(func) {
    return func;
  }

  _getPortableTriggersList(triggers) {
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

  _getPortableTriggerDefinition(trigger) {
    return trigger;
  }

  _getPortableSequencesList(sequences) {
    const list = [];
    for (const value of sequences) {
      list.push(this._getPortableSequenceDefinition(value));
    }
    return list;
  }

  _getPortableSequenceDefinition(sequence) {
    throw new Error('notSupported Sequences');
  }

  _getPortableTableColumnList(table, database, tableColumns) {

    const list = [];
    for (const tableColumn of tableColumns) {
      let column = null;


      column = this._getPortableTableColumnDefinition(tableColumn);

      if (!column) {
        continue;
      }
      const name = column.getQuotedName(this.grammar).toLowerCase();
      list[name] = column;
    }
    return list;
  }

  _getPortableTableColumnDefinition(tableColumn) {
    throw new Error('not implement');
  }

  _getPortableTableIndexesList(tableIndexRows, tableName = null) {
    var _a, _b;
    const result = [];
    for (const tableIndex of tableIndexRows) {
      let keyName;
      const indexName = keyName = tableIndex['key_name'];
      if (tableIndex['primary']) {
        keyName = 'primary';
      }
      keyName = keyName.toLowerCase();
      if (!(result[keyName] !== undefined)) {
        const options = {
          'lengths': []
        };
        if (tableIndex['where'] !== undefined) {
          options['where'] = tableIndex['where'];
        }
        result[keyName] = {
          'name': indexName,
          'columns': [],
          'unique': !tableIndex['non_unique'],
          'primary': tableIndex['primary'],
          'flags': (_a = tableIndex['flags']) !== null && _a !== void 0 ? _a : [],
          'options': options
        };
      }
      result[keyName]['columns'].push(tableIndex['column_name']);
      result[keyName]['options']['lengths'].push((_b = tableIndex['length']) !== null && _b !== void 0 ? _b : null);
    }

    const indexes = {};
    for (const [indexKey, data] of Object.entries(result)) {
      let index = null;


      index = {
        name: data['name'],
        columns: data['columns'],
        unique: data['unique'],
        primary: data['primary'],
        flags: data['flags'],
        options: data['options']
      };

      if (!index) {
        continue;
      }
      indexes[indexKey] = index;
    }
    return indexes;
  }

  _getPortableTablesList(tables) {
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

  _getPortableTableDefinition(table) {
    return table;
  }

  _getPortableUsersList(users) {
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

  _getPortableUserDefinition(user) {
    return user;
  }


  _getPortableViewDefinition(view) {
    return false;
  }

  listDatabases() {
    return __awaiter(this, void 0, void 0, function* () {
      const sql = this.grammar.getListDatabasesSQL();
      const databases = yield this.connection.select(sql);
      return this._getPortableDatabasesList(databases);
    });
  }

  listNamespaceNames() {
    return __awaiter(this, void 0, void 0, function* () {
      const sql = this.grammar.getListNamespacesSQL();
      const namespaces = yield this.connection.select(sql);
      return this.getPortableNamespacesList(namespaces);
    });
  }

  listSequences(database = null) {
    return __awaiter(this, void 0, void 0, function* () {
      if (database === null) {
        database = this.connection.getDatabaseName();
      }
      const sql = this.grammar.getListSequencesSQL(database);
      const sequences = yield this.connection.select(sql);
      return this.filterAssetNames(this._getPortableSequencesList(sequences));
    });
  }

  listTableColumns(table, database) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!database) {
        database = this.connection.getDatabaseName();
      }
      const sql = this.grammar.getListTableColumnsSQL(table, database);
      const tableColumns = yield this.connection.select(sql);
      return this._getPortableTableColumnList(table, database, tableColumns);
    });
  }

  listTableIndexes(table) {
    return __awaiter(this, void 0, void 0, function* () {
      const sql = this.grammar.getListTableIndexesSQL(table, this.connection.getDatabaseName());
      const tableIndexes = yield this.connection.select(sql);
      return this._getPortableTableIndexesList(tableIndexes, table);
    });
  }

  tablesExist(tableNames) {
    return __awaiter(this, void 0, void 0, function* () {
      tableNames = wrap(tableNames).map(it => it.toLowerCase());
      return tableNames.length === intersection(tableNames, (yield this.listTableNames()).map(it => it.toLowerCase())).length;
    });
  }

  listTableNames() {
    return __awaiter(this, void 0, void 0, function* () {
      const sql = this.grammar.getListTablesSQL();
      const tables = yield this.connection.select(sql);
      const tableNames = this._getPortableTablesList(tables);
      return this.filterAssetNames(tableNames);
    });
  }

  filterAssetNames(assetNames) {
    const filter = this.connection.getConfig().getSchemaAssetsFilter();
    if (!filter) {
      return assetNames;
    }
    return assetNames.filter(filter);
  }

  getFilterSchemaAssetsExpression() {
    return this.connection.getConfig().getFilterSchemaAssetsExpression();
  }

  listTables() {
    return __awaiter(this, void 0, void 0, function* () {
      const tableNames = yield this.listTableNames();
      const tables = [];
      for (const tableName of tableNames) {
        tables.push(this.listTableDetails(tableName));
      }
      return tables;
    });
  }

  listTableDetails(tableName) {
    return __awaiter(this, void 0, void 0, function* () {
      const columns = yield this.listTableColumns(tableName);
      let foreignKeys = [];
      if (this.grammar.supportsForeignKeyConstraints()) {
        foreignKeys = yield this.listTableForeignKeys(tableName);
      }
      const indexes = yield this.listTableIndexes(tableName);
      return new Table(tableName, columns, indexes, foreignKeys);
    });
  }

  listTableForeignKeys(table, database = null) {
    return __awaiter(this, void 0, void 0, function* () {
      if (database === null) {
        database = this.connection.getDatabaseName();
      }
      const sql = this.grammar.getListTableForeignKeysSQL(table, database);
      const tableForeignKeys = yield this.connection.select(sql);
      return this._getPortableTableForeignKeysList(tableForeignKeys);
    });
  }

  _getPortableTableForeignKeysList(tableForeignKeys) {
    const list = [];
    for (const value of tableForeignKeys) {
      list.push(this._getPortableTableForeignKeyDefinition(value));
    }
    return list;
  }

  _getPortableTableForeignKeyDefinition(tableForeignKey) {
    return tableForeignKey;
  }


  createBlueprint(table, callback = null) {
    const prefix = this.connection.getConfig('prefix_indexes') ?
      this.connection.getConfig('prefix') : '';
    if (this.resolver !== undefined) {
      return this.resolver(table, callback, prefix);
    }
    return new Blueprint(table, callback, prefix);
  }

  registerCustomDoctrineType(clazz, name, type) {


  }

  getConnection() {
    return this.connection;
  }

  setConnection(connection) {
    this.connection = connection;
    return this;
  }

  blueprintResolver(resolver) {
    this.resolver = resolver;
  }
}

SchemaBuilder._defaultStringLength = 255;

SchemaBuilder._defaultMorphKeyType = 'int';
