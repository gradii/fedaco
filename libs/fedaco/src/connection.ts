/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray, isBlank, isBoolean, isFunction, isPromise } from '@gradii/nanofn';
import { format } from 'date-fns';
import type { BaseGrammar } from './base-grammar';
import type { SqliteWrappedConnection } from './connector/sqlite/sqlite-wrapped-connection';
import type { WrappedConnection } from './connector/wrapped-connection';
import type { WrappedStmt } from './connector/wrapped-stmt';
import { DatabaseTransactionsManager } from './database-transactions-manager';
// import { DatabaseTransactionsManager } from './database-transactions-manager';
import { QueryExecuted } from './events/query-executed';
import { StatementPrepared } from './events/statement-prepared';
import { TransactionBeginning } from './events/transaction-beginning';
import { TransactionCommitted } from './events/transaction-committed';
import { TransactionRolledBack } from './events/transaction-rolled-back';
import type { Dispatcher } from './fedaco/mixins/has-events';
import { get } from './helper/obj';
import { mixinManagesTransactions } from './manages-transactions';
import { raw } from './query-builder/ast-factory';
import type { ConnectionInterface } from './query-builder/connection-interface';
import type { QueryGrammar } from './query-builder/grammar/query-grammar';
import { Processor } from './query-builder/processor';
import { QueryBuilder } from './query-builder/query-builder';
import { QueryException } from './query-exception';
import type { SchemaGrammar } from './schema/grammar/schema-grammar';
import { SchemaBuilder } from './schema/schema-builder';

export class Connection extends mixinManagesTransactions(class {
}) implements ConnectionInterface {
  /*The active PDO connection.*/
  protected pdo: WrappedConnection | Function;
  /*The active PDO connection used for reads.*/
  protected readPdo: Function;
  /*The name of the connected database.*/
  protected database: string;

  protected readWriteType: string;
  /*The type of the connection.*/
  protected type: string | null;
  /*The table prefix for the connection.*/
  protected tablePrefix = '';
  /*The database connection configuration options.*/
  protected config: any[] = [];
  /*The reconnector instance for the connection.*/
  protected reconnector: Function;
  /*The query grammar implementation.*/
  _queryGrammar: QueryGrammar;
  /*The schema grammar implementation.*/
  protected schemaGrammar: SchemaGrammar;
  /*The query post processor implementation.*/
  protected postProcessor: Processor;
  /*The event dispatcher instance.*/
  protected events: Dispatcher;
  /*The default fetch mode of the connection.*/
  protected fetchMode = -1;
  /*Indicates if changes have been made to the database.*/
  protected recordsModified = false;
  /*Indicates if the connection should use the "write" PDO connection.*/
  protected readOnWriteConnection = false;
  /*All of the queries run against the connection.*/
  protected queryLog: any[] = [];
  /*Indicates whether queries are being logged.*/
  protected loggingQueries = false;
  /*Indicates if the connection is in a "dry run".*/
  protected _dryRun = false;
  /*The instance of Doctrine connection.*/
  // protected doctrineConnection: DbalConnection;
  /*The connection resolvers.*/
  protected static resolvers: any = {};

  /*Create a new database connection instance.*/
  public constructor(pdo: Function, database: string = '', tablePrefix: string = '',
                     config: any                                               = {}) {
    super();
    this.pdo         = pdo;
    this.database    = database;
    this.tablePrefix = tablePrefix;
    this.config      = config;
    this.useDefaultQueryGrammar();
    this.useDefaultPostProcessor();

    if (isFunction(pdo)) {
      this.reconnector = () => {
        this.pdo = pdo;
        return this.getPdo();
      };
    }
  }

  /*Set the query grammar to the default implementation.*/
  public useDefaultQueryGrammar() {
    this._queryGrammar = this.getDefaultQueryGrammar();
  }

  /*Get the default query grammar instance.*/
  protected getDefaultQueryGrammar(): QueryGrammar {
    throw new Error('not implement');
  }

  /*Set the schema grammar to the default implementation.*/
  public useDefaultSchemaGrammar() {
    this.schemaGrammar = this.getDefaultSchemaGrammar();
  }

  /*Get the default schema grammar instance.*/
  protected getDefaultSchemaGrammar(): SchemaGrammar {
    throw new Error('not implement');
  }

  /*Set the query post processor to the default implementation.*/
  public useDefaultPostProcessor() {
    this.postProcessor = this.getDefaultPostProcessor();
  }

  /*Get the default post processor instance.*/
  protected getDefaultPostProcessor() {
    return new Processor();
  }

  /*Get a schema builder instance for the connection.*/
  public getSchemaBuilder(): SchemaBuilder {
    if (isBlank(this.schemaGrammar)) {
      this.useDefaultSchemaGrammar();
    }
    return new SchemaBuilder(this);
  }

  /*Begin a fluent query against a database table.*/
  public table(table: Function | QueryBuilder | string, as?: string): QueryBuilder {
    return this.query().from(table, as);
  }

  /*Get a new query builder instance.*/
  public query(): QueryBuilder {
    return new QueryBuilder(this, this.getQueryGrammar(), this.getPostProcessor());
  }

  /*Run a select statement and return a single result.*/
  public async selectOne(query: string, bindings: any[] = [], useReadPdo: boolean = true) {
    const records = await this.select(query, bindings, useReadPdo);
    return records.shift();
  }

  /*Run a select statement against the database.*/
  public async selectFromWriteConnection(query: string, bindings: any[] = []) {
    return this.select(query, bindings, false);
  }

  /*Run a select statement against the database.*/
  public async select(query: string, bindings: any[] = [], useReadPdo: boolean = true) {
    return await this.run(query, bindings, async (q: string, _bindings: any[]) => {
      if (this.dryRun()) {
        return [];
      }
      const pdo: SqliteWrappedConnection = await this.getPdoForSelect(useReadPdo);

      const statement = await pdo.prepare(q);
      this.bindValues(statement, this.prepareBindings(_bindings));
      return await statement.fetchAll();
    });
  }

  /*Configure the PDO prepared statement.*/
  protected prepared(statement: any) {
    statement.setFetchMode(this.fetchMode);
    this.event(new StatementPrepared(this, statement));
    return statement;
  }

  /*Get the PDO connection to use for a select query.*/
  protected getPdoForSelect(useReadPdo: boolean = true) {
    return useReadPdo ? this.getReadPdo() : this.getPdo();
  }

  /*Run an insert statement against the database.*/
  public async insert(query: string, bindings: any[] = []) {
    return this.statement(query, bindings);
  }

  public async insertGetId(query: string, bindings: any[] = [], sequence?: string) {
    await this.statement(query, bindings);
    return await (await this.getPdo()).lastInsertId();
  }

  /*Run an update statement against the database.*/
  public update(query: string, bindings: any[] = []) {
    return this.affectingStatement(query, bindings);
  }

  /*Run a delete statement against the database.*/
  public delete(query: string, bindings: any[] = []) {
    return this.affectingStatement(query, bindings);
  }

  /*Execute an SQL statement and return the boolean result.*/
  public async statement(query: string, bindings: any = []) {
    return await this.run(query, bindings, async (q: string, _bindings: any) => {
      if (this.dryRun()) {
        return true;
      }
      const pdo: WrappedConnection = (await this.getPdo());

      const statement = await pdo.prepare(q);
      statement.bindValues(this.prepareBindings(_bindings));
      this.recordsHaveBeenModified();
      return await statement.execute();
    });
  }

  /*Run an SQL statement and get the number of rows affected.*/
  public async affectingStatement(query: string, bindings: any[] = []) {
    return this.run(query, bindings, async (q: string, _bindings: any[]) => {
      if (this.dryRun()) {
        return 0;
      }
      const pdo       = await this.getPdo();
      const statement = await pdo.prepare(q);
      this.bindValues(statement, this.prepareBindings(_bindings));
      await statement.execute();
      const count = statement.affectCount();
      this.recordsHaveBeenModified(count > 0);
      return count;
    });
  }

  // /*Run a raw, unprepared query against the PDO connection.*/
  // public async unprepared(query: string) {
  //   return this.run(query, [], async (q: string) => {
  //     if (this.dryRun()) {
  //       return true;
  //     }
  //     const change = (await this.getPdo()).exec(q) !== false;
  //     this.recordsHaveBeenModified(change);
  //     return change;
  //   });
  // }

  /*Execute the given callback in "dry run" mode.*/
  public pretend(callback: Function) {
    return this.withFreshQueryLog(() => {
      this._dryRun = true;
      callback(this);
      this._dryRun = false;
      return this.queryLog;
    });
  }

  /*Execute the given callback in "dry run" mode.*/
  protected withFreshQueryLog(callback: Function) {
    const loggingQueries = this.loggingQueries;
    this.enableQueryLog();
    this.queryLog       = [];
    const result        = callback();
    this.loggingQueries = loggingQueries;
    return result;
  }

  /**
   * Bind values to their parameters in the given statement.
   * @param statement
   * @param bindings
   */
  public bindValues(statement: WrappedStmt, bindings: any[]) {
    // throw new Error('should deprecated');
    if (isArray(bindings)) {
      statement.bindValues(bindings);
    } else {
      throw new Error('not implement');
    }
    // for (const [key, value] of Object.entries(bindings)) {
    //   statement.bindValue(isString(key) ? key : key + 1, value,
    //     /*is_int(value) ? PDO.PARAM_INT : PDO.PARAM_STR*/);
    // }
  }

  /*Prepare the query bindings for execution.*/
  public prepareBindings(bindings: any[]) {
    const rst     = [];
    const grammar = this.getQueryGrammar();
    for (const value of bindings) {
      if (value instanceof Date) {
        // todo should get connection date timezone
        rst.push(format(value, grammar.getDateFormat()));
      } else if (isBoolean(value)) {
        rst.push( /*cast type int*/ value ? 1 : 0);
      } else {
        rst.push(value);
      }
    }
    return rst;
  }

  /*Run a SQL statement and log its execution context.*/
  protected async run(query: string, bindings: any[], callback: Function) {
    this._reconnectIfMissingConnection();
    const start = +new Date();
    let result;
    try {
      result = await this.runQueryCallback(query, bindings, callback);
    } catch (e: any) {
      result = this.handleQueryException(e, query, bindings, callback);
    }
    this.logQuery(query, bindings, this.getElapsedTime(start));
    return result;
  }

  /*Run a SQL statement.*/
  protected async runQueryCallback(query: string, bindings: any[], callback: Function) {
    try {
      return await callback(query, bindings);
    } catch (e: any) {
      throw new QueryException(query, this.prepareBindings(bindings), e.message);
    }
  }

  /*Log a query in the connection's query log.*/
  public logQuery(query: string, bindings: any[], time: number | null = null) {
    this.event(new QueryExecuted(query, bindings, time, this));
    if (this.loggingQueries) {
      this.queryLog.push([query, bindings, time]);
    }
  }

  /*Get the elapsed time since a given starting point.*/
  protected getElapsedTime(start: number) {
    return Math.round((+new Date() - start) * 1000);
  }

  /*Handle a query exception.*/
  protected handleQueryException(e: QueryException, query: string, bindings: any[],
                                 callback: Function) {
    if (this._transactions >= 1) {
      throw e;
    }
    return this.tryAgainIfCausedByLostConnection(e, query, bindings, callback);
  }

  /*Handle a query exception that occurred during query execution.*/
  protected async tryAgainIfCausedByLostConnection(e: QueryException, query: string, bindings: any[],
                                             callback: Function) {
    if (this.causedByLostConnection(e.message)) {
      await this.reconnect();
      return this.runQueryCallback(query, bindings, callback);
    }
    throw e;
  }

  protected causedByLostConnection(message: string): boolean {
    if ([
      'lost connection', // pdo
      'Can\'t add new command when connection is in closed state', // mysql2 driver
    ].find(it => message.includes(it))) {
      return true;
    }
    return false;
  }

  /*Reconnect to the database.*/
  public async reconnect() {
    if (isFunction(this.reconnector)) {
      // this.doctrineConnection = null;
      return this.reconnector.call(this);
    }
    throw new Error('LogicException Lost connection and no reconnector available.');
  }

  /*Reconnect to the database if a PDO connection is missing.*/
  _reconnectIfMissingConnection() {
    if (isBlank(this.pdo)) {
      this.reconnect();
    }
  }

  /*Disconnect from the underlying PDO connection.*/
  public disconnect() {
    this.setPdo(null).setReadPdo(null);
  }

  /*Register a database query listener with the connection.*/
  public listen(callback: Function) {
    // if (this.events !== undefined) {
    //   this.events.listen(QueryExecuted, callback);
    // }
  }

  /*Fire an event for this connection.*/
  _fireConnectionEvent(event: string) {
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

  /*Fire the given event if possible.*/
  protected event(event: any) {
    if (this.events !== undefined) {
      this.events.dispatch(event);
    }
  }

  /*Get a new raw query expression.*/
  public raw(value: any) {
    return raw(value);
  }

  /*Determine if the database connection has modified any database records.*/
  public hasModifiedRecords() {
    return this.recordsModified;
  }

  /*Indicate if any records have been modified.*/
  public recordsHaveBeenModified(value: boolean = true) {
    if (!this.recordsModified) {
      this.recordsModified = value;
    }
  }

  /*Set the record modification state.*/
  public setRecordModificationState(value: boolean) {
    this.recordsModified = value;
    return this;
  }

  /*Reset the record modification state.*/
  public forgetRecordModificationState() {
    this.recordsModified = false;
  }

  /*Indicate that the connection should use the write PDO connection for reads.*/
  public useWriteConnectionWhenReading(value: boolean = true) {
    this.readOnWriteConnection = value;
    return this;
  }

  /*Is Doctrine available?*/
  public isDoctrineAvailable() {
    // return class_exists('Doctrine\\DBAL\\Connection');
  }

  /*Get a Doctrine Schema Column instance.*/
  public async getDoctrineColumn(table: string, column: string) {
    // const schema = this.getDoctrineSchemaManager();
    // return schema.listTableDetails(table).getColumn(column);
  }

  /*Get the Doctrine DBAL schema manager for the connection.*/
  public getDoctrineSchemaManager() {
    // const connection = this.getDoctrineConnection();
    // return this.getDoctrineDriver().getSchemaManager(connection, connection.getDatabasePlatform());
  }

  /*Get the Doctrine DBAL database connection instance.*/
  public getDoctrineConnection() {
    // if (isBlank(this.doctrineConnection)) {
    //   const driver = this.getDoctrineDriver();
    //
    //   this.doctrineConnection = driver.connect();
    // }
    // return this.doctrineConnection;
  }

  protected getDoctrineDriver() {
    throw new Error('not implement');
  }

  /*Get the current PDO connection.*/
  public async getPdo(): Promise<WrappedConnection> {
    if (isPromise(this.pdo)) {
      throw new Error('pdo should not be promise');
    }
    if (isFunction(this.pdo)) {
      this.pdo = await this.pdo.call(this);
      return this.pdo as WrappedConnection;
    }
    return this.pdo;
  }

  /*Get the current PDO connection parameter without executing any reconnect logic.*/
  public getRawPdo() {
    return this.pdo;
  }

  /*Get the current PDO connection used for reading.*/
  public getReadPdo() {
    if (this._transactions > 0) {
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

  /*Get the current read PDO connection parameter without executing any reconnect logic.*/
  public getRawReadPdo() {
    return this.readPdo;
  }

  /*Set the PDO connection.*/
  public setPdo(pdo?: Function) {
    this._transactions = 0;
    this.pdo           = pdo;
    return this;
  }

  /*Set the PDO connection used for reading.*/
  public setReadPdo(pdo?: Function) {
    this.readPdo = pdo;
    return this;
  }

  /*Set the reconnect instance on the connection.*/
  public setReconnector(reconnector: Function) {
    this.reconnector = reconnector;
    return this;
  }

  /*Get the database connection name.*/
  public getName() {
    return this.getConfig('name');
  }

  /*Get the database connection full name.*/
  public getNameWithReadWriteType() {
    return this.getName() + (this.readWriteType ? '::' + this.readWriteType : '');
  }

  /*Get an option from the configuration options.*/
  public getConfig(option?: string) {
    return get(this.config, option);
  }

  /*Get the PDO driver name.*/
  public getDriverName() {
    return this.getConfig('driver');
  }

  /*Get the query grammar used by the connection.*/
  public getQueryGrammar() {
    return this._queryGrammar;
  }

  /*Set the query grammar used by the connection.*/
  public setQueryGrammar(grammar: QueryGrammar) {
    this._queryGrammar = grammar;
    return this;
  }

  /*Get the schema grammar used by the connection.*/
  public getSchemaGrammar() {
    return this.schemaGrammar;
  }

  /*Set the schema grammar used by the connection.*/
  public setSchemaGrammar(grammar: SchemaGrammar) {
    this.schemaGrammar = grammar;
    return this;
  }

  /*Get the query post processor used by the connection.*/
  public getPostProcessor() {
    return this.postProcessor;
  }

  /*Set the query post processor used by the connection.*/
  public setPostProcessor(processor: Processor) {
    this.postProcessor = processor;
    return this;
  }

  /*Get the event dispatcher used by the connection.*/
  public getEventDispatcher() {
    return this.events;
  }

  /*Set the event dispatcher instance on the connection.*/
  public setEventDispatcher(events: Dispatcher) {
    this.events = events;
    return this;
  }

  /*Unset the event dispatcher for this connection.*/
  public unsetEventDispatcher() {
    this.events = null;
  }

  /*Determine if the connection is in a "dry run".*/
  public dryRun() {
    return this._dryRun === true;
  }

  /*Get the connection query log.*/
  public getQueryLog() {
    return this.queryLog;
  }

  /*Clear the query log.*/
  public flushQueryLog() {
    this.queryLog = [];
  }

  /*Enable the query log on the connection.*/
  public enableQueryLog() {
    this.loggingQueries = true;
  }

  /*Disable the query log on the connection.*/
  public disableQueryLog() {
    this.loggingQueries = false;
  }

  /*Determine whether we're logging queries.*/
  public logging() {
    return this.loggingQueries;
  }

  /*Get the name of the connected database.*/
  public getDatabaseName() {
    return this.database;
  }

  /*Set the name of the connected database.*/
  public setDatabaseName(database: string) {
    this.database = database;
    return this;
  }

  /*Set the read / write type of the connection.*/
  public setReadWriteType(readWriteType?: string) {
    this.readWriteType = readWriteType;
    return this;
  }

  /*Get the table prefix for the connection.*/
  public getTablePrefix() {
    return this.tablePrefix;
  }

  /*Set the table prefix in use by the connection.*/
  public setTablePrefix(prefix: string) {
    this.tablePrefix = prefix;
    this.getQueryGrammar().setTablePrefix(prefix);
    return this;
  }

  /*Set the table prefix and return the grammar.*/
  public withTablePrefix<T extends BaseGrammar = BaseGrammar>(grammar: T): T {
    grammar.setTablePrefix(this.tablePrefix);
    return grammar;
  }

  causedByConcurrencyError(e: Error) {
    console.warn(`catch an error check whether is concurrency error.
    if it's raised in transaction you can report this error ${e.message} to make this function more better.`);
    // @ts-ignore
    if (e.code === '40001') {
      return true;
    }

    const msgs = [
      'Deadlock found when trying to get lock',
      'deadlock detected',
      'The database file is locked',
      'database is locked',
      'database table is locked',
      'A table in the database is locked',
      'has been chosen as the deadlock victim',
      'Lock wait timeout exceeded; try restarting transaction',
      'WSREP detected deadlock/conflict and aborted the transaction. Try restarting the transaction',
    ];
    return msgs.find(it => e.message.includes(it));
  }

  /*Register a connection resolver.*/
  public static resolverFor(driver: string, callback: Function) {
    Connection.resolvers[driver] = callback;
  }

  /*Get the connection resolver for the given driver.*/
  public static getResolver(driver: string) {
    return Connection.resolvers[driver] ?? null;
  }

}
