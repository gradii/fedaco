import { __awaiter } from 'tslib';
import { isArray, isBlank, isBoolean, isFunction, isPromise } from '@gradii/check-type';
import { format } from 'date-fns';

import { QueryExecuted } from './events/query-executed';
import { StatementPrepared } from './events/statement-prepared';
import { TransactionBeginning } from './events/transaction-beginning';
import { TransactionCommitted } from './events/transaction-committed';
import { TransactionRolledBack } from './events/transaction-rolled-back';
import { get } from './helper/obj';
import { raw } from './query-builder/ast-factory';
import { Processor } from './query-builder/processor';
import { QueryBuilder } from './query-builder/query-builder';
import { QueryException } from './query-exception';
import { SchemaBuilder } from './schema/schema-builder';

export class Connection {

  constructor(pdo, database = '', tablePrefix = '', config = {}) {

    this.tablePrefix = '';

    this.config = [];

    this.fetchMode = -1;

    this.transactions = 0;


    this.recordsModified = false;

    this.readOnWriteConnection = false;

    this.queryLog = [];

    this.loggingQueries = false;

    this._dryRun = false;
    this.pdo = pdo;
    this.database = database;
    this.tablePrefix = tablePrefix;
    this.config = config;
    this.useDefaultQueryGrammar();
    this.useDefaultPostProcessor();
  }

  useDefaultQueryGrammar() {
    this.queryGrammar = this.getDefaultQueryGrammar();
  }

  getDefaultQueryGrammar() {
    throw new Error('not implement');
  }

  useDefaultSchemaGrammar() {
    this.schemaGrammar = this.getDefaultSchemaGrammar();
  }

  getDefaultSchemaGrammar() {
    throw new Error('not implement');
  }

  useDefaultPostProcessor() {
    this.postProcessor = this.getDefaultPostProcessor();
  }

  getDefaultPostProcessor() {
    return new Processor();
  }

  getSchemaBuilder() {
    if (isBlank(this.schemaGrammar)) {
      this.useDefaultSchemaGrammar();
    }
    return new SchemaBuilder(this);
  }

  table(table, as = null) {
    return this.query().from(table, as);
  }

  query() {
    return new QueryBuilder(this, this.getQueryGrammar(), this.getPostProcessor());
  }

  selectOne(query, bindings = [], useReadPdo = true) {
    return __awaiter(this, void 0, void 0, function* () {
      const records = yield this.select(query, bindings, useReadPdo);
      return records.shift();
    });
  }

  selectFromWriteConnection(query, bindings = []) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.select(query, bindings, false);
    });
  }

  select(query, bindings = [], useReadPdo = true) {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.run(query, bindings, (q, _bindings) => __awaiter(this, void 0, void 0, function* () {
        if (this.dryRun()) {
          return [];
        }
        const pdo = yield this.getPdoForSelect(useReadPdo);
        const statement = yield pdo.prepare(q);
        this.bindValues(statement, this.prepareBindings(_bindings));
        return yield statement.fetchAll();
      }));
    });
  }

  prepared(statement) {
    statement.setFetchMode(this.fetchMode);
    this.event(new StatementPrepared(this, statement));
    return statement;
  }

  getPdoForSelect(useReadPdo = true) {
    return useReadPdo ? this.getReadPdo() : this.getPdo();
  }

  insert(query, bindings = []) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.statement(query, bindings);
    });
  }

  insertGetId(query, bindings = [], sequence) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.statement(query, bindings);
      return yield (yield this.getPdo()).lastInsertId();
    });
  }

  update(query, bindings = []) {
    return this.affectingStatement(query, bindings);
  }

  delete(query, bindings = []) {
    return this.affectingStatement(query, bindings);
  }

  statement(query, bindings = []) {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.run(query, bindings, (q, _bindings) => __awaiter(this, void 0, void 0, function* () {
        if (this.dryRun()) {
          return true;
        }
        const pdo = (yield this.getPdo());
        const statement = yield pdo.prepare(q);
        statement.bindValues(this.prepareBindings(_bindings));
        this.recordsHaveBeenModified();
        return yield statement.execute();
      }));
    });
  }

  affectingStatement(query, bindings = []) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.run(query, bindings, (q, _bindings) => __awaiter(this, void 0, void 0, function* () {
        if (this.dryRun()) {
          return 0;
        }
        const pdo = yield this.getPdo();
        const statement = yield pdo.prepare(q);
        this.bindValues(statement, this.prepareBindings(_bindings));
        yield statement.execute();
        const count = statement.affectCount();
        this.recordsHaveBeenModified(count > 0);
        return count;
      }));
    });
  }


  pretend(callback) {
    return this.withFreshQueryLog(() => {
      this._dryRun = true;
      callback(this);
      this._dryRun = false;
      return this.queryLog;
    });
  }

  withFreshQueryLog(callback) {
    const loggingQueries = this.loggingQueries;
    this.enableQueryLog();
    this.queryLog = [];
    const result = callback();
    this.loggingQueries = loggingQueries;
    return result;
  }

  bindValues(statement, bindings) {

    if (isArray(bindings)) {
      statement.bindValues(bindings);
    } else {
      throw new Error('not implement');
    }


  }

  prepareBindings(bindings) {
    const rst = [];
    const grammar = this.getQueryGrammar();
    for (const value of bindings) {
      if (value instanceof Date) {

        rst.push(format(value, grammar.getDateFormat()));
      } else if (isBoolean(value)) {
        rst.push(value ? 1 : 0);
      } else {
        rst.push(value);
      }
    }
    return rst;
  }

  run(query, bindings, callback) {
    return __awaiter(this, void 0, void 0, function* () {
      this.reconnectIfMissingConnection();
      const start = +new Date();
      let result;
      try {
        result = yield this.runQueryCallback(query, bindings, callback);
      } catch (e) {
        result = this.handleQueryException(e, query, bindings, callback);
      }
      this.logQuery(query, bindings, this.getElapsedTime(start));
      return result;
    });
  }

  runQueryCallback(query, bindings, callback) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        return yield callback(query, bindings);
      } catch (e) {
        throw new QueryException(query, this.prepareBindings(bindings), e.message);
      }
    });
  }

  logQuery(query, bindings, time = null) {
    this.event(new QueryExecuted(query, bindings, time, this));
    if (this.loggingQueries) {
      this.queryLog.push([query, bindings, time]);
    }
  }

  getElapsedTime(start) {
    return Math.round((+new Date() - start) * 1000);
  }

  handleQueryException(e, query, bindings, callback) {
    if (this.transactions >= 1) {
      throw e;
    }
    return this.tryAgainIfCausedByLostConnection(e, query, bindings, callback);
  }

  tryAgainIfCausedByLostConnection(e, query, bindings, callback) {
    if (this.causedByLostConnection(e.message)) {
      this.reconnect();
      return this.runQueryCallback(query, bindings, callback);
    }
    throw e;
  }

  causedByLostConnection(message) {
    if (message.includes('lost connection')) {
      return true;
    }
    return false;
  }

  reconnect() {
    if (isFunction(this.reconnector)) {

      return this.reconnector.call(this);
    }
    throw new Error('LogicException Lost connection and no reconnector available.');
  }

  reconnectIfMissingConnection() {
    if (isBlank(this.pdo)) {
      this.reconnect();
    }
  }

  disconnect() {
    this.setPdo(null).setReadPdo(null);
  }

  listen(callback) {


  }

  fireConnectionEvent(event) {
    if (!(this.events !== undefined)) {
      return;
    }
    switch (event) {
      case 'beganTransaction':
        return this.events.dispatch(new TransactionBeginning(this));
      case 'committed':
        return this.events.dispatch(new TransactionCommitted(this));
      case 'rollingBack':
        return this.events.dispatch(new TransactionRolledBack(this));
    }
  }

  event(event) {
    if (this.events !== undefined) {
      this.events.dispatch(event);
    }
  }

  raw(value) {
    return raw(value);
  }

  hasModifiedRecords() {
    return this.recordsModified;
  }

  recordsHaveBeenModified(value = true) {
    if (!this.recordsModified) {
      this.recordsModified = value;
    }
  }

  setRecordModificationState(value) {
    this.recordsModified = value;
    return this;
  }

  forgetRecordModificationState() {
    this.recordsModified = false;
  }

  useWriteConnectionWhenReading(value = true) {
    this.readOnWriteConnection = value;
    return this;
  }

  isDoctrineAvailable() {

  }

  getDoctrineColumn(table, column) {
    return __awaiter(this, void 0, void 0, function* () {


    });
  }

  getDoctrineSchemaManager() {


  }

  getDoctrineConnection() {


  }

  getDoctrineDriver() {
    throw new Error('not implement');
  }

  getPdo() {
    return __awaiter(this, void 0, void 0, function* () {
      if (isPromise(this.pdo)) {
        throw new Error('pdo should not be promise');
      }
      if (isFunction(this.pdo)) {
        this.pdo = yield this.pdo.call(this);
        return this.pdo;
      }
      return this.pdo;
    });
  }

  getRawPdo() {
    return this.pdo;
  }

  getReadPdo() {
    if (this.transactions > 0) {
      return this.getPdo();
    }
    if (this.readOnWriteConnection || this.recordsModified && this.getConfig('sticky')) {
      return this.getPdo();
    }
    if (isFunction(this.readPdo)) {
      return this.readPdo = this.readPdo.call(this);
    }
    return this.readPdo || this.getPdo();
  }

  getRawReadPdo() {
    return this.readPdo;
  }

  setPdo(pdo) {
    this.transactions = 0;
    this.pdo = pdo;
    return this;
  }

  setReadPdo(pdo) {
    this.readPdo = pdo;
    return this;
  }

  setReconnector(reconnector) {
    this.reconnector = reconnector;
    return this;
  }

  getName() {
    return this.getConfig('name');
  }

  getNameWithReadWriteType() {
    return this.getName() + (this.readWriteType ? '::' + this.readWriteType : '');
  }

  getConfig(option) {
    return get(this.config, option);
  }

  getDriverName() {
    return this.getConfig('driver');
  }

  getQueryGrammar() {
    return this.queryGrammar;
  }

  setQueryGrammar(grammar) {
    this.queryGrammar = grammar;
    return this;
  }

  getSchemaGrammar() {
    return this.schemaGrammar;
  }

  setSchemaGrammar(grammar) {
    this.schemaGrammar = grammar;
    return this;
  }

  getPostProcessor() {
    return this.postProcessor;
  }

  setPostProcessor(processor) {
    this.postProcessor = processor;
    return this;
  }

  getEventDispatcher() {
    return this.events;
  }

  setEventDispatcher(events) {
    this.events = events;
    return this;
  }

  unsetEventDispatcher() {
    this.events = null;
  }


  dryRun() {
    return this._dryRun === true;
  }

  getQueryLog() {
    return this.queryLog;
  }

  flushQueryLog() {
    this.queryLog = [];
  }

  enableQueryLog() {
    this.loggingQueries = true;
  }

  disableQueryLog() {
    this.loggingQueries = false;
  }

  logging() {
    return this.loggingQueries;
  }

  getDatabaseName() {
    return this.database;
  }

  setDatabaseName(database) {
    this.database = database;
    return this;
  }

  setReadWriteType(readWriteType) {
    this.readWriteType = readWriteType;
    return this;
  }

  getTablePrefix() {
    return this.tablePrefix;
  }

  setTablePrefix(prefix) {
    this.tablePrefix = prefix;
    this.getQueryGrammar().setTablePrefix(prefix);
    return this;
  }

  withTablePrefix(grammar) {
    grammar.setTablePrefix(this.tablePrefix);
    return grammar;
  }

  static resolverFor(driver, callback) {
    Connection.resolvers[driver] = callback;
  }

  static getResolver(driver) {
    var _a;
    return (_a = Connection.resolvers[driver]) !== null && _a !== void 0 ? _a : null;
  }

  transaction(callback) {
    return __awaiter(this, void 0, void 0, function* () {
    });
  }
}


Connection.resolvers = {};
