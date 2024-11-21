/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  isAnyEmpty, isArray, isBlank, isBoolean, isFunction, isNumber, isString
} from '@gradii/nanofn';
import { FedacoBuilder } from '../fedaco/fedaco-builder';
import { Relation } from '../fedaco/relations/relation';
import { ColumnReferenceExpression } from '../query/ast/column-reference-expression';
import {
  ComparisonPredicateExpression
} from '../query/ast/expression/comparison-predicate-expression';
import { RawExpression } from '../query/ast/expression/raw-expression';
import {
  NestedPredicateExpression
} from '../query/ast/fragment/expression/nested-predicate-expression';
import { NestedExpression } from '../query/ast/fragment/nested-expression';
import { FromTable } from '../query/ast/from-table';
import { PathExpression } from '../query/ast/path-expression';
import { TableReferenceExpression } from '../query/ast/table-reference-expression';
import { SqlParser } from '../query/parser/sql-parser';
import { bindingVariable, createIdentifier, raw, rawSqlBindings } from './ast-factory';
import { wrapToArray } from './ast-helper';
import { Builder } from './builder';
import type { ConnectionInterface } from './connection-interface';
import type { GrammarInterface } from './grammar.interface';
import type { ProcessorInterface } from './processor-interface';


export const enum BindingType {
  where = 'where',
  join  = 'join'
}

export class QueryBuilder extends Builder {

  /*The database connection instance.*/
  _connection: ConnectionInterface;
  /*The database query post processor instance.*/
  _processor: ProcessorInterface;

  /*All of the available clause operators.*/
  public operators: any[] = [
    '=', '<', '>', '<=', '>=', '<>', '!=', '<=>', 'like', 'like binary',
    'not like', 'ilike', '&', '|', '^', '<<', '>>', 'rlike', 'not rlike',
    'regexp', 'not regexp', '~', '~*', '!~', '!~*', 'similar to',
    'not similar to', 'not ilike', '~~*', '!~~*'
  ];
  /*Whether use write connection for select.*/
  _useWriteConnection = false;

  private _sqlParser: SqlParser;

  constructor(
    connection: ConnectionInterface,
    grammar: GrammarInterface,
    processor: ProcessorInterface | null = null
  ) {
    super();
    this._connection = connection;
    // todo
    // this._grammar = grammar || connection.getQueryGrammar();
    // this._processor = processor || connection.getPostProcessor();
    this._grammar   = grammar;
    this._processor = processor;

    this._sqlParser = new SqlParser();
  }

  /*Create a new query instance for a sub-query.*/
  _forSubQuery() {
    return this.newQuery();
  }

  public clone(): QueryBuilder {
    const cloned        = this.newQuery();
    cloned._sqlParser   = this._sqlParser;
    // cloned._bindings    = this._bindings;
    cloned._aggregate   = this._aggregate;
    cloned._columns     = [...this._columns];
    cloned._distinct    = this._distinct;
    cloned._from        = this._from;
    cloned._joins       = [...this._joins];
    cloned._wheres      = [...this._wheres];
    cloned._groups      = [...this._groups];
    cloned._havings     = [...this._havings];
    cloned._orders      = [...this._orders];
    cloned._limit       = this._limit;
    cloned._offset      = this._offset;
    cloned._unions      = [...this._unions];
    cloned._unionLimit  = this._unionLimit;
    cloned._unionOffset = this._unionOffset;
    cloned._lock        = this._lock;

    cloned._beforeQueryCallbacks = [...this._beforeQueryCallbacks];
    return cloned;
  }

  /*Clone the query without the given properties.*/
  public cloneWithout(properties: any[]): QueryBuilder {
    const cloned = this.clone();
    for (const property of properties) {
      // @ts-ignore
      cloned[property] = isArray(cloned[property]) ? [] : undefined;
    }
    return cloned;
  }

  /**
   * Prepare the value and operator for a where clause.
   */
  _prepareValueAndOperator<P = any>(value: P, operator: string, useDefault?: boolean): [P, string];

  _prepareValueAndOperator(value: any, operator: string, useDefault?: boolean) {
    if (useDefault) {
      return [operator, '='];
    } else if (this._invalidOperatorAndValue(operator, value)) {
      throw new Error('InvalidArgumentException Illegal operator and value combination.');
    }
    return [value, operator];
  }

  _invalidOperator(operator: string | any): boolean {
    if (isString(operator)) {
      return !this.operators.includes(operator.toLowerCase()) &&
        !this._grammar.getOperators().includes(operator.toLowerCase());
    }
    return false;
  }

  _newJoinClause(parentQuery: QueryBuilder, type: string,
                 table: string | TableReferenceExpression): JoinClauseBuilder {
    return new JoinClauseBuilder(parentQuery, type, table);
  }

  /*Creates a subquery and parse it.*/
  _createSubQuery(type: 'select' | string, query: Function | QueryBuilder | string) {
    if (isFunction(query)) {
      const callback = query
      callback(query = this._forSubQuery());
    }
    return this._parseSub(type, query);
  }

  _createSubPredicate(query: Function | QueryBuilder | string) {
    if (isFunction(query)) {
      query(query = this._forSubQuery());
    } else if (isString(query)) {
      return new NestedPredicateExpression(query);
    }
    return new NestedPredicateExpression(query);
  }

  /*Parse the subquery into SQL and bindings.*/
  _parseSub(type: 'select' | string, query: any) {
    if (
      query instanceof QueryBuilder // ||
      // query instanceof EloquentBuilder || todo
      // query instanceof Relation todo
    ) {
      return new NestedExpression(type, query.toSql(), query.getBindings());
    } else if (query instanceof FedacoBuilder) {
      const {result: sql, bindings} = query.toSql();
      return new NestedExpression(type, sql, bindings);
    } else if (isString(query)) {
      return new NestedExpression(type, query, []);
    } else {
      throw new Error(
        'InvalidArgumentException A subquery must be a query builder instance, a Closure, or a string.');
    }
  }

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

  _selectAs(columns: { [key: string]: string }): this;

  _selectAs(columns: string | { [key: string]: string }, as?: string): this {
    if (arguments.length === 2) {
      // this.selectSub(columns, as);
      // if(isArray(columns)) {
      //
      // }

      this._columns.push(
        new ColumnReferenceExpression(
          new PathExpression(
            [createIdentifier(columns as string)]
          ),
          createIdentifier(as)
        )
      );
    } else {
      for (const [_as, _column] of Object.entries<string>(columns)) {
        if (this.isQueryable(_column)) {
          this.selectSub(_column, _as);
        } else {
          throw new Error(`column is not queryable ${_column}`);
        }
      }
    }

    return this;
  }

  public find(id: number | string, columns: any[] = ['*']) {
    return this.where('id', '=', id).first(columns);
  }


  /*Get an array with the values of a given column.*/
  public async pluck(column: string, key?: string): Promise<any[] | Record<string, any>> {
    const queryResult = await this.onceWithColumns(isBlank(key) ? [column] : [column, key],
      async () => {
        return this._processor.processSelect(this, await this.runSelect());
      });
    column            = this.stripTableForPluck(column);
    key               = this.stripTableForPluck(key);
    return this.pluckFromColumn(
      queryResult,
      column,
      key
    );
  }

  public mergeWheres(_wheres: any[], bindings: object | any[]) {
    this._wheres = this._wheres.concat(_wheres);
    if (typeof bindings === 'object') {
      bindings = Object.values(bindings);
    }
    this._bindings['where'] = this._bindings['where'].concat(bindings);
  }

  /*Strip off the table name or alias from a column identifier.*/
  protected stripTableForPluck(column: string) {
    if (isBlank(column)) {
      return column;
    }
    const separator = column.toLowerCase().indexOf(' as ') > -1 ? ' as ' : '\\.';
    return column.split(new RegExp(separator, 'ig')).pop();
  }

  /*Retrieve column values from rows represented as objects.*/
  protected pluckFromColumn(queryResult: any[], column: string,
                            key?: string): any[] | Record<string, any> {
    if (isBlank(key)) {
      const results = [];
      for (const row of queryResult) {
        results.push(row[column]);
      }
      return results;
    } else {
      const results: Record<string, any> = {};
      for (const row of queryResult) {
        results[row[key]] = row[column];
      }
      return results;
    }
  }


  public addBinding(value: any, type: string = 'where') {
    if (!this._bindings[type]) {
      throw new Error(`InvalidArgumentException Invalid binding type: ${type}.`);
    }
    if (isArray(value)) {
      this._bindings[type] = [...this._bindings[type], ...value];
    } else {
      this._bindings[type].push(value);
    }
    return this;
  }

  public addSelect(...col: string[]): this;

  public addSelect(...col: RawExpression[]): this;

  public addSelect(...col: ColumnReferenceExpression[]): this;

  public addSelect(columns: Array<string | RawExpression | ColumnReferenceExpression>): this;

  public addSelect(
    columns: string | RawExpression | ColumnReferenceExpression |
      Array<string | RawExpression | ColumnReferenceExpression>
  ): this {
    // @ts-ignore
    columns = isArray(columns) ? columns : [...arguments];
    for (const column of columns as any[]) {
      if (column instanceof RawExpression) {
        this._columns.push(column);
      } else if (isString(column)) {
        const _column = SqlParser.createSqlParser(column).parseColumnAlias();
        this._columns.push(_column);
      } else if (column instanceof ColumnReferenceExpression) {
        this._columns.push(column);
      }
    }
    return this;
  }

  public distinct(...args: (string | boolean)[]): this {
    const columns = args;
    if (columns.length > 0) {
      this._distinct = isArray(columns[0]) || isBoolean(
        columns[0]) ? columns[0] as boolean : columns;
    } else {
      this._distinct = true;
    }
    return this;
  }

  /*Insert a new record and get the value of the primary key.*/
  public async insertGetId(values: any, sequence: string = 'id') {
    this.applyBeforeQueryCallbacks();

    const sql = this._grammar.compileInsertGetId(this, values, sequence);
    return this._processor.processInsertGetId(
      this,
      sql,
      this.getBindings()
      , sequence);
  }

  public from(table: Function | QueryBuilder | RawExpression | string, as?: string): this {
    if (this.isQueryable(table)) {
      return this.fromSub(table, as);
    }
    if (table instanceof RawExpression) {
      this._from = new FromTable(table);
    } else {
      const from = as ? `${table} as ${as}` : table as string;
      this._from = new FromTable(SqlParser.createSqlParser(from).parseTableAlias());
    }

    return this;
  }

  public fromSub(table: (q: QueryBuilder) => void, as: string): this;
  public fromSub(table: any, as: string): this;
  public fromSub(table: any, as: string): this {
    if (table instanceof QueryBuilder || isFunction(table)) {
      this._from = new FromTable(
        new TableReferenceExpression(this._createSubQuery('from', table) as NestedExpression,
          createIdentifier(as))
      );
    } else if (isString(table)) {
      this.from(table);
    } else {
      throw new Error('InvalidArgumentException');
    }

    return this;
  }

  // todo should be promise or callback
  /**
   * get for column is temp used for query
   * @param columns
   */
  public async get(columns: string | string[] = ['*']): Promise<any[]> {
    columns = wrapToArray(columns);
    return await this.onceWithColumns(columns, async () => {
      return this._processor.processSelect(this, await this.runSelect());
    });
  }

  // public raw(value) {
  //   return this._connection.raw(value);
  // }

  public getBindings() {
    const rst = [];
    for (const item of Object.values(this._bindings)) {
      for (const it of item) {
        rst.push(it);
      }
    }
    return rst;
  }

  getConnection() {
    return this._connection;
  }

  /*Insert new records into the table using a subquery.*/
  public async insertUsing(columns: any[],
                           query: ((q: QueryBuilder) => void) | QueryBuilder | string) {
    this.applyBeforeQueryCallbacks();

    if (!this.isQueryable(query)) {
      throw new Error('InvalidArgumentException');
    }
    const node = this._createSubQuery('insert', query);
    return this._connection.affectingStatement(
      this._grammar.compileInsertUsing(this, columns, node),
      this.getBindings()
    );
  }


  /*Insert a new record into the database while ignoring errors.*/
  public insertOrIgnore(values: any) {
    if (isAnyEmpty(values)) {
      return 0;
    }

    this.applyBeforeQueryCallbacks();

    return this._connection.affectingStatement(
      this._grammar.compileInsertOrIgnore(this, values),
      this.getBindings()
      // this._cleanBindings(insertValues)
    );
  }

  getGrammar() {
    return this._grammar;
  }

  getProcessor() {
    return this._processor;
  }

  public getRawBindings() {
    return this._bindings;
  }

  isQueryable(value: QueryBuilder | FedacoBuilder | Relation | Function | any): value is (QueryBuilder | Function) {
    return value instanceof QueryBuilder ||
      value instanceof FedacoBuilder ||
      value instanceof Relation ||
      isFunction(value);
  }

  public newQuery<T extends Builder = QueryBuilder>(): T {
    // @ts-ignore
    return new QueryBuilder(this._connection, this._grammar, this._processor);
  }

  async runSelect() {
    return this._connection.select(
      this.toSql(),
      this.getBindings(),
      !this._useWriteConnection
    );
  }

  /*Add a new "raw" select expression to the query.*/
  public selectRaw(expression: string, bindings: any[] = []) {
    this._columns.push(rawSqlBindings(expression, bindings));
    // if (bindings) {
    //   this.addBinding(bindings, 'select');
    // }
    return this;
  }

  public select(...col: (string | RawExpression)[]): this;

  public select(...col: ColumnReferenceExpression[]): this;

  public select(columns: (string | RawExpression)[]): this;

  public select(columns: string | string[] | RawExpression[] | ColumnReferenceExpression[] | any): this {
    this._columns            = [];
    this._bindings['select'] = [];

    columns = isArray(columns) ? columns : [...arguments];
    this.addSelect(columns);
    return this;
  }


  /*Update a record in the database.*/
  public async update(values: any = {}): Promise<any> {
    this.applyBeforeQueryCallbacks();

    const sql = this._grammar.compileUpdate(this, values);
    return await this._connection.update(sql,
      this.getBindings()
    );
  }

  /*Increment a column's value by a given amount.*/
  public increment(column: string, amount: number = 1, extra: any = {}): Promise<any> {
    if (!isNumber(amount)) {
      throw new Error('InvalidArgumentException Non-numeric value passed to increment method.');
    }
    const wrapped = this._grammar.wrap(column);
    const columns = {[column]: raw(`${wrapped} + ${amount}`), ...extra};
    return this.update(columns);
  }

  /*Decrement a column's value by a given amount.*/
  public decrement(column: string, amount: number = 1, extra: any = {}): Promise<any> {
    if (!isNumber(amount)) {
      throw new Error('InvalidArgumentException Non-numeric value passed to decrement method.');
    }
    const wrapped = this._grammar.wrap(column);
    const columns = {[column]: raw(`${wrapped} - ${amount}`), ...extra};
    return this.update(columns);
  }

  /*Delete a record from the database.*/
  public delete(id?: any) {
    if (!isBlank(id)) {
      this.addWhere(
        new ComparisonPredicateExpression(
          new ColumnReferenceExpression(
            new PathExpression(
              [
                this._from,
                createIdentifier('id')
              ]
            )
          ),
          '=',
          bindingVariable(id)
        )
      );
    }

    this.applyBeforeQueryCallbacks();

    return this._connection.delete(
      this._grammar.compileDelete(this),
      this.getBindings()
    );
  }

  /*Run a truncate statement on the table.*/
  public truncate() {
    this.applyBeforeQueryCallbacks();

    for (const [sql, bindings] of Object.entries(this._grammar.compileTruncate(this))) {
      this._connection.statement(sql, this.getBindings());
    }
  }

  /*Insert or update a record matching the attributes, and fill it with values.*/
  public async updateOrInsert(attributes: object, values: object = {}) {
    if (isBlank(this._from)) {
      throw new Error('must call from before insert');
    }
    if (!await this.where(attributes).exists()) {
      return await this.insert({...attributes, ...values});
    }
    if (isAnyEmpty(values)) {
      return true;
    }
    return await this.limit(1).update(values);
  }

  /*Insert new records or update the existing ones.*/
  public upsert(values: any[], uniqueBy: any[] | string, update: any[] | null = null) {
    if (!values.length) {
      return 0;
    } else if (!update?.length) {
      return /*cast type int*/ this.insert(values);
    }
    if (!isArray(values)) {
      values = [values];
    }/* else {
      for (let [key, value] of Object.entries(values)) {
        // ksort(value);
        values[key] = value;
      }
    }*/
    if (isBlank(update)) {
      update = Object.keys(values[0]);
    }

    this.applyBeforeQueryCallbacks();

    // var bindings = this.cleanBindings([...Arr.flatten(values, 1), ...collect(update)
    //   .reject((value, key) => {
    //   return isNumber(key);
    // }).all()]);
    return this._connection.affectingStatement(
      this._grammar.compileUpsert(this, values, /*cast type array*/ uniqueBy, update),
      this.getBindings()
    );
  }

  public async insert(values: any | any[]) {
    // Since every insert gets treated like a batch insert, we will make sure the
    // bindings are structured in a way that is convenient when building these
    // inserts statements by verifying these elements are actually an array.
    if (isBlank(values)) {
      return true;
    }
    if (!isArray(values)) {
      values = [values];
    } else {
      // // Here, we will sort the insert keys for every record so that each insert is
      // // in the same order for the record. We need to make sure this is the case
      // // so there are not any errors or problems when inserting these records.
      //
      // for (let [key, value] of Object.entries(values)) {
      //   // ksort(value);
      //   values[key] = value;
      // }
    }

    this.applyBeforeQueryCallbacks();

    return this._connection.insert(
      this._grammar.compileInsert(this, values),
      this.getBindings()
      // this._cleanBindings(insertValues)
    );
  }

  // protected _cleanBindings(bindings: any[]) {
  //   return bindings.filter(it=>!(it instanceof RawExpression))
  // }

  selectSub(query: (q: QueryBuilder) => void, as: string): this;
  selectSub(query: QueryBuilder | string, as: string): this;
  selectSub(query: Function | QueryBuilder | string, as: string): this {
    let columnAsNode;
    if (isString(as)) {
      columnAsNode = SqlParser.createSqlParser(as).parseAsName();
    }

    this._columns.push(
      new ColumnReferenceExpression(
        this._createSubQuery('select', query),
        columnAsNode
      )
    );

    return this;
  }

  lock(value: boolean | string = true) {
    this._lock = value;
    if (!isBlank(this.lock)) {
      this.useWriteConnection();
    }
    return this;
  }

  /**
   * Register a closure to be invoked before the query is executed.
   * @param callback
   */
  beforeQuery(callback: (...args: any[]) => any) {
    this._beforeQueryCallbacks.push(callback);

    return this;
  }

  /**
   * Invoke the "before query" modification callbacks.
   */
  public applyBeforeQueryCallbacks() {
    for (const callback of this._beforeQueryCallbacks) {
      callback(this);
    }

    this._beforeQueryCallbacks = [];
  }

  toSql() {
    this.applyBeforeQueryCallbacks();

    this.resetBindings();
    return this._grammar.compileSelect(this);
  }

  resetBindings() {
    for (const it of Object.keys(this._bindings)) {
      this._bindings[it] = [];
    }
  }


  useReadConnection() {
    this._useWriteConnection = false;
    return this;
  }

  useWriteConnection() {
    this._useWriteConnection = true;
    return this;
  }

  /**
   * Determine if the given operator and value combination is legal.
   * Prevents using Null values with invalid operators.
   */
  protected _invalidOperatorAndValue(operator: string, value: any) {
    return isBlank(value) && this.operators.includes(operator) && !['=', '<>', '!='].includes(
      operator);
  }

  protected async onceWithColumns(columns: string[],
                                  callback: () => Promise<any[]>): Promise<any[]> {
    const original = this._columns;
    // todo check
    if (original.length === 0) {
      this._columns = columns.map(it => SqlParser.createSqlParser(it).parseColumnAlias());
    }
    const result  = await callback();
    this._columns = original;

    // todo temp fix array
    return wrapToArray(result);
  }
}

export class JoinClauseBuilder extends QueryBuilder {
  /*The type of join being performed.*/
  public type: string;
  /*The table the join clause is joining to.*/
  public table: string | TableReferenceExpression;


  /*Create a new join clause instance.*/
  public constructor(parentQuery: QueryBuilder, type: string,
                     table: string | TableReferenceExpression) {
    super(parentQuery.getConnection(), parentQuery.getGrammar(), parentQuery.getProcessor());
    this.type  = type;
    this.table = table;
  }

  /*Get a new instance of the join clause builder.*/
  public override newQuery<T extends Builder = JoinClauseBuilder>(): T {
    // @ts-ignore
    return new JoinClauseBuilder(this.newParentQuery(), this.type, this.table);
  }

  /*Add an "on" clause to the join.

  On clauses can be chained, e.g.

  Join->on('contacts.user_id', '=', 'users.id')
  ->on('contacts.info_id', '=', 'info.id')

  will produce the following SQL:

  on `contacts`.`user_id` = `users`.`id` and `contacts`.`info_id` = `info`.`id`*/
  public on(first: ((q?: JoinClauseBuilder) => any) | string,
            operator?: string,
            second?: string,
            conjunction: 'and' | 'or' = 'and') {
    if (isFunction(first)) {
      return this.whereNested(first as ((q?: QueryBuilder) => any), conjunction);
    }
    return this.whereColumn(first, operator, second, conjunction);
  }

  /*Add an "or on" clause to the join.*/
  public orOn(first: ((query?: JoinClauseBuilder) => any) | string,
              operator?: string,
              second?: string): this {
    return this.on(first, operator, second, 'or');
  }

  /*Create a new query instance for sub-query.*/
  protected forSubQuery() {
    return this.newParentQuery().newQuery();
  }

  /*Create a new parent query instance.*/
  protected newParentQuery() {
    return super.newQuery();
  }

}
