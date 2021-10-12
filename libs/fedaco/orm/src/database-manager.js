import { __awaiter } from 'tslib';
import { DatabaseConfig } from './database-config';
import { MysqlQueryGrammar } from './query-builder/grammar/mysql-query-grammar';
import { Processor } from './query-builder/processor';
import { QueryBuilder } from './query-builder/query-builder';

class Conn {
  constructor() {
    this._query = new QueryBuilder(this, new MysqlQueryGrammar(), new Processor());
  }

  query() {
    return this._query;
  }

  select(sql, bindings, readConnection) {
    return __awaiter(this, void 0, void 0, function* () {
      return Promise.resolve();
    });
  }

  insert() {
    return __awaiter(this, void 0, void 0, function* () {
      return false;
    });
  }

  update() {
    return __awaiter(this, void 0, void 0, function* () {
    });
  }

  delete() {
    return __awaiter(this, void 0, void 0, function* () {
    });
  }

  statement() {
  }

  affectingStatement() {
    return __awaiter(this, void 0, void 0, function* () {
    });
  }

  getName() {
    return '';
  }

  getSchemaBuilder() {
    throw new Error('not implement');
  }

  getConfig(name) {
  }

  getPdo() {
  }

  recordsHaveBeenModified() {
  }

  selectFromWriteConnection(sql, values) {
  }

  table(table, as) {
    return undefined;
  }

  insertGetId(sql, bindings, sequence) {
    return undefined;
  }
}

export class DatabaseManager {

  constructor(factory) {

    this.connections = {};
    this.factory = factory;
    this.reconnector = (connection) => {
      this.reconnect(connection.getNameWithReadWriteType());
    };
  }

  connection(name) {
    const [database, type] = this.parseConnectionName(name);
    name = name || database;
    if (!(this.connections[name] !== undefined)) {
      this.connections[name] = this.configure(this.makeConnection(database), type);
    }
    return this.connections[name];
  }

  parseConnectionName(name) {
    name = name || this.getDefaultConnection();
    return /(::read|::write)$/.exec(name) ? name.split('::') : [name, null];
  }

  makeConnection(name) {
    const config = this.configuration(name);


    return this.factory.make(config, name);
  }

  configuration(name) {
    name = name || this.getDefaultConnection();

    const config = DatabaseConfig.instance.config;

    return config['database']['connections'][name];


  }

  configure(connection, type) {


    return connection;
  }

  setPdoForType(connection, type = null) {


  }

  purge(name = null) {


  }

  disconnect(name = null) {


  }

  reconnect(name = null) {


  }

  usingConnection(name, callback) {


  }

  refreshPdoConnections(name) {


  }

  getDefaultConnection() {
    return 'default';

  }

  setDefaultConnection(name) {

  }

  supportedDrivers() {

  }

  availableDrivers() {

  }

  extend(name, resolver) {

  }

  getConnections() {
    return this.connections;
  }

  setReconnector(reconnector) {
    this.reconnector = reconnector;
  }
}
