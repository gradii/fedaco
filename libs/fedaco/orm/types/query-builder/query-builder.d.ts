/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoBuilder } from '../fedaco/fedaco-builder';
import { Relation } from '../fedaco/relations/relation';
import { ColumnReferenceExpression } from '../query/ast/column-reference-expression';
import { RawExpression } from '../query/ast/expression/raw-expression';
import { NestedPredicateExpression } from '../query/ast/fragment/expression/nested-predicate-expression';
import { NestedExpression } from '../query/ast/fragment/nested-expression';
import { TableReferenceExpression } from '../query/ast/table-reference-expression';
import { Builder } from './builder';
import { ConnectionInterface } from './connection-interface';
import { GrammarInterface } from './grammar.interface';
import { ProcessorInterface } from './processor-interface';
export declare const enum BindingType {
    where = "where",
    join = "join"
}
export declare class QueryBuilder extends Builder {
    _connection: ConnectionInterface;
    _processor: ProcessorInterface;
    operators: any[];
    _useWriteConnection: boolean;
    private _sqlParser;
    constructor(connection: ConnectionInterface, grammar: GrammarInterface, processor?: ProcessorInterface | null);
    _forSubQuery(): QueryBuilder;
    clone(): QueryBuilder;
    cloneWithout(properties: any[]): QueryBuilder;
    /**
     * Prepare the value and operator for a where clause.
     */
    _prepareValueAndOperator<P = any>(value: P, operator: string, useDefault?: boolean): [P, string];
    _invalidOperator(operator: string | any): boolean;
    _newJoinClause(parentQuery: QueryBuilder, type: string, table: string | TableReferenceExpression): JoinClauseBuilder;
    _createSubQuery(type: 'select' | string, query: Function | QueryBuilder | string): NestedExpression;
    _createSubPredicate(query: Function | QueryBuilder | string): NestedPredicateExpression;
    _parseSub(type: 'select' | string, query: any): NestedExpression;
    /**
     * {
     *   as1: column1,
     *   as2: column2,
     *   as3: column3,
     * }
     * @param columns
     * @param as
     */
    _selectAs(columns: string, as: string): this;
    _selectAs(columns: {
        [key: string]: string;
    }): this;
    find(id: number | string, columns?: any[]): Promise<any>;
    pluck(column: string, key?: string): Promise<any[] | Record<string, any>>;
    mergeWheres(_wheres: any[], bindings: object | any[]): void;
    protected stripTableForPluck(column: string): string;
    protected pluckFromColumn(queryResult: any[], column: string, key?: string): any[] | Record<string, any>;
    addBinding(value: any, type?: string): this;
    addSelect(...col: string[]): this;
    addSelect(...col: RawExpression[]): this;
    addSelect(...col: ColumnReferenceExpression[]): this;
    addSelect(columns: Array<string | RawExpression | ColumnReferenceExpression>): this;
    distinct(...args: (string | boolean)[]): this;
    insertGetId(values: any, sequence?: string): Promise<number>;
    from(table: Function | QueryBuilder | RawExpression | string, as?: string): this;
    fromSub(table: (q: QueryBuilder) => void, as: string): this;
    fromSub(table: any, as: string): this;
    /**
     * get for column is temp used for query
     * @param columns
     */
    get(columns?: string | string[]): Promise<any[]>;
    getBindings(): any[];
    getConnection(): ConnectionInterface;
    insertUsing(columns: any[], query: ((q: QueryBuilder) => void) | QueryBuilder | string): Promise<any>;
    insertOrIgnore(values: any): any;
    getGrammar(): GrammarInterface<Builder>;
    getProcessor(): ProcessorInterface;
    getRawBindings(): {
        [key: string]: any[];
    };
    isQueryable(value: QueryBuilder | FedacoBuilder | Relation | Function | any): value is (QueryBuilder | Function);
    newQuery<T extends Builder = QueryBuilder>(): T;
    runSelect(): Promise<any>;
    selectRaw(expression: string, bindings?: any[]): this;
    select(...col: (string | RawExpression)[]): this;
    select(...col: ColumnReferenceExpression[]): this;
    select(columns: (string | RawExpression)[]): this;
    update(values?: any): Promise<any>;
    increment(column: string, amount?: number, extra?: any): Promise<any>;
    decrement(column: string, amount?: number, extra?: any): Promise<any>;
    delete(id?: any): any;
    truncate(): void;
    updateOrInsert(attributes: object, values?: object): Promise<any>;
    upsert(values: any[], uniqueBy: any[] | string, update?: any[] | null): any;
    insert(values: any | any[]): Promise<boolean>;
    selectSub(query: (q: QueryBuilder) => void, as: string): this;
    selectSub(query: QueryBuilder | string, as: string): this;
    lock(value?: boolean | string): this;
    /**
     * Register a closure to be invoked before the query is executed.
     * @param callback
     */
    beforeQuery(callback: (...args: any[]) => any): this;
    /**
     * Invoke the "before query" modification callbacks.
     */
    applyBeforeQueryCallbacks(): void;
    toSql(): string;
    resetBindings(): void;
    useReadConnection(): this;
    useWriteConnection(): this;
    /**
     * Determine if the given operator and value combination is legal.
     * Prevents using Null values with invalid operators.
     */
    protected _invalidOperatorAndValue(operator: string, value: any): boolean;
    protected onceWithColumns(columns: string[], callback: () => Promise<any[]>): Promise<any[]>;
}
export declare class JoinClauseBuilder extends QueryBuilder {
    type: string;
    table: string | TableReferenceExpression;
    constructor(parentQuery: QueryBuilder, type: string, table: string | TableReferenceExpression);
    newQuery<T extends Builder = JoinClauseBuilder>(): T;
    on(first: ((q?: JoinClauseBuilder) => any) | string, operator?: string, second?: string, conjunction?: 'and' | 'or'): this;
    orOn(first: ((query?: JoinClauseBuilder) => any) | string, operator?: string, second?: string): this;
    protected forSubQuery(): QueryBuilder;
    protected newParentQuery(): QueryBuilder;
}
