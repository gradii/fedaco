/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { BaseGrammar } from './base-grammar';
import { WrappedConnection } from './connector/wrapped-connection';
import { WrappedStmt } from './connector/wrapped-stmt';
import { Dispatcher } from './fedaco/mixins/has-events';
import { ConnectionInterface } from './query-builder/connection-interface';
import { QueryGrammar } from './query-builder/grammar/query-grammar';
import { Processor } from './query-builder/processor';
import { QueryBuilder } from './query-builder/query-builder';
import { QueryException } from './query-exception';
import { SchemaGrammar } from './schema/grammar/schema-grammar';
import { SchemaBuilder } from './schema/schema-builder';
declare const Connection_base: new (...args: any[]) => import("@gradii/fedaco/src/manages-transactions").ManagesTransactions;
export declare class Connection extends Connection_base implements ConnectionInterface {
    protected pdo: WrappedConnection | Function;
    protected readPdo: Function;
    protected database: string;
    protected readWriteType: string;
    protected type: string | null;
    protected tablePrefix: string;
    protected config: any[];
    protected reconnector: Function;
    _queryGrammar: QueryGrammar;
    protected schemaGrammar: SchemaGrammar;
    protected postProcessor: Processor;
    protected events: Dispatcher;
    protected fetchMode: number;
    protected recordsModified: boolean;
    protected readOnWriteConnection: boolean;
    protected queryLog: any[];
    protected loggingQueries: boolean;
    protected _dryRun: boolean;
    protected static resolvers: any;
    constructor(pdo: Function, database?: string, tablePrefix?: string, config?: any);
    useDefaultQueryGrammar(): void;
    protected getDefaultQueryGrammar(): QueryGrammar;
    useDefaultSchemaGrammar(): void;
    protected getDefaultSchemaGrammar(): SchemaGrammar;
    useDefaultPostProcessor(): void;
    protected getDefaultPostProcessor(): Processor;
    getSchemaBuilder(): SchemaBuilder;
    table(table: Function | QueryBuilder | string, as?: string): QueryBuilder;
    query(): QueryBuilder;
    selectOne(query: string, bindings?: any[], useReadPdo?: boolean): Promise<any>;
    selectFromWriteConnection(query: string, bindings?: any[]): Promise<any>;
    select(query: string, bindings?: any[], useReadPdo?: boolean): Promise<any>;
    protected prepared(statement: any): any;
    protected getPdoForSelect(useReadPdo?: boolean): any;
    insert(query: string, bindings?: any[]): Promise<any>;
    insertGetId(query: string, bindings?: any[], sequence?: string): Promise<number>;
    update(query: string, bindings?: any[]): Promise<any>;
    delete(query: string, bindings?: any[]): Promise<any>;
    statement(query: string, bindings?: any): Promise<any>;
    affectingStatement(query: string, bindings?: any[]): Promise<any>;
    pretend(callback: Function): any;
    protected withFreshQueryLog(callback: Function): any;
    /**
     * Bind values to their parameters in the given statement.
     * @param statement
     * @param bindings
     */
    bindValues(statement: WrappedStmt, bindings: any[]): void;
    prepareBindings(bindings: any[]): any[];
    protected run(query: string, bindings: any[], callback: Function): Promise<any>;
    protected runQueryCallback(query: string, bindings: any[], callback: Function): Promise<any>;
    logQuery(query: string, bindings: any[], time?: number | null): void;
    protected getElapsedTime(start: number): number;
    protected handleQueryException(e: QueryException, query: string, bindings: any[], callback: Function): Promise<any>;
    protected tryAgainIfCausedByLostConnection(e: QueryException, query: string, bindings: any[], callback: Function): Promise<any>;
    protected causedByLostConnection(message: string): boolean;
    reconnect(): Promise<any>;
    _reconnectIfMissingConnection(): void;
    disconnect(): void;
    listen(callback: Function): void;
    _fireConnectionEvent(event: string): void;
    protected event(event: any): void;
    raw(value: any): import("@gradii/fedaco").RawExpression;
    hasModifiedRecords(): boolean;
    recordsHaveBeenModified(value?: boolean): void;
    setRecordModificationState(value: boolean): this;
    forgetRecordModificationState(): void;
    useWriteConnectionWhenReading(value?: boolean): this;
    isDoctrineAvailable(): void;
    getDoctrineColumn(table: string, column: string): Promise<void>;
    getDoctrineSchemaManager(): void;
    getDoctrineConnection(): void;
    protected getDoctrineDriver(): void;
    getPdo(): Promise<WrappedConnection>;
    getRawPdo(): Function | WrappedConnection;
    getReadPdo(): any;
    getRawReadPdo(): Function;
    setPdo(pdo?: Function): this;
    setReadPdo(pdo?: Function): this;
    setReconnector(reconnector: Function): this;
    getName(): any;
    getNameWithReadWriteType(): string;
    getConfig(option?: string): any;
    getDriverName(): any;
    getQueryGrammar(): QueryGrammar;
    setQueryGrammar(grammar: QueryGrammar): this;
    getSchemaGrammar(): SchemaGrammar;
    setSchemaGrammar(grammar: SchemaGrammar): this;
    getPostProcessor(): Processor;
    setPostProcessor(processor: Processor): this;
    getEventDispatcher(): Dispatcher;
    setEventDispatcher(events: Dispatcher): this;
    unsetEventDispatcher(): void;
    dryRun(): boolean;
    getQueryLog(): any[];
    flushQueryLog(): void;
    enableQueryLog(): void;
    disableQueryLog(): void;
    logging(): boolean;
    getDatabaseName(): string;
    setDatabaseName(database: string): this;
    setReadWriteType(readWriteType?: string): this;
    getTablePrefix(): string;
    setTablePrefix(prefix: string): this;
    withTablePrefix<T extends BaseGrammar = BaseGrammar>(grammar: T): T;
    causedByConcurrencyError(e: Error): string | true;
    static resolverFor(driver: string, callback: Function): void;
    static getResolver(driver: string): any;
}
export {};
