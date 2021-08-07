import {
  isAnyEmpty,
  isArray,
  isBlank,
  isBoolean,
  isFunction,
  isString
} from '@gradii/check-type';
import { ColumnReferenceExpression } from '../query/ast/column-reference-expression';
import { ComparisonPredicateExpression } from '../query/ast/expression/comparison-predicate-expression';
import { RawExpression } from '../query/ast/expression/raw-expression';
import { NestedPredicateExpression } from '../query/ast/fragment/expression/nested-predicate-expression';
import { NestedExpression } from '../query/ast/fragment/nested-expression';
import { FromTable } from '../query/ast/from-table';
import { PathExpression } from '../query/ast/path-expression';
import { TableReferenceExpression } from '../query/ast/table-reference-expression';
import { SqlParser } from '../query/parser/sql-parser';
import {
  bindingVariable,
  createIdentifier,
  rawSqlBindings
} from './ast-factory';
import { wrapToArray } from './ast-helper';
import { Builder } from './builder';
import { ConnectionInterface } from './connection-interface';
import { GrammarInterface } from './grammar.interface';
import { ProcessorInterface } from './processor-interface';


export enum BindingType {
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

  public clone() {
    const cloned        = this.newQuery();
    cloned._sqlParser   = this._sqlParser;
    // cloned._bindings    = this._bindings;
    cloned._aggregate   = this._aggregate;
    cloned._columns     = this._columns;
    cloned._distinct    = this._distinct;
    cloned._from        = this._from;
    cloned._joins       = this._joins;
    cloned._wheres      = this._wheres;
    cloned._groups      = this._groups;
    cloned._havings     = this._havings;
    cloned._orders      = this._orders;
    cloned._limit       = this._limit;
    cloned._offset      = this._offset;
    cloned._unions      = this._unions;
    cloned._unionLimit  = this._unionLimit;
    cloned._unionOffset = this._unionOffset;
    cloned._lock        = this._lock;
    return cloned;
  }

  /*Clone the query without the given properties.*/
  public cloneWithout(properties: any[]): this {
    const cloned = this.clone();
    for (const property of properties) {
      cloned[property] = isArray(cloned[property]) ? [] : undefined;
    }
    return cloned;
  }

  /**
   * Prepare the value and operator for a where clause.
   */
  _prepareValueAndOperator<P = any>(value: P, operator: string, useDefault?: boolean): [P, string]

  _prepareValueAndOperator(value, operator, useDefault?: boolean) {
    if (useDefault) {
      return [operator, '='];
    } else if (this._invalidOperatorAndValue(operator, value)) {
      throw new Error('InvalidArgumentException Illegal operator and value combination.');
    }
    return [value, operator];
  }

  _invalidOperator(operator: string): boolean {
    if (isString(operator)) {
      return !this.operators.includes(operator.toLowerCase()) &&
        !this._grammar.getOperators().includes(operator.toLowerCase());
    }
    return false;
  }

  _newJoinClause(parentQuery: QueryBuilder, type: string, table: string | TableReferenceExpression): JoinQueryBuilder {
    return new JoinQueryBuilder(parentQuery, type, table);
  }

  /*Creates a subquery and parse it.*/
  _createSubQuery(type, query: Function | QueryBuilder | string) {
    if (isFunction(query)) {
      query(query = this._forSubQuery());
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
  _parseSub(type, query: any) {
    if (
      query instanceof QueryBuilder //||
      // query instanceof EloquentBuilder || todo
      // query instanceof Relation todo
    ) {
      return new NestedExpression(type, query.toSql(), query.getBindings());
    } else if (isString(query)) {
      return new NestedExpression(type, query, []);
    } else {
      throw new Error('InvalidArgumentException A subquery must be a query builder instance, a Closure, or a string.');
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
  _selectAs(columns: string, as: string)

  _selectAs(columns: { [key: string]: string })

  _selectAs(columns, as?) {
    if (arguments.length === 2) {
      // this.selectSub(columns, as);
      // if(isArray(columns)) {
      //
      // }

      this._columns.push(
        new ColumnReferenceExpression(
          new PathExpression(
            [createIdentifier(columns)]
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
  public pluck(column: string, key: string | null = null) {
    const queryResult = this.onceWithColumns(isBlank(key) ? [column] : [column, key], () => {
      return this._processor.processSelect(this, this.runSelect());
    });
    // if (empty(queryResult)) {
    //   return collect();
    // }
    column = this.stripTableForPluck(column);
    key    = this.stripTableForPluck(key);
    return this.pluckFromColumn(
      queryResult,
      column,
      key
    );
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
  protected pluckFromColumn(queryResult: any[], column: string, key: string) {
    let results;
    if (isBlank(key)) {
      results = [];
      for (const row of queryResult) {
        results.push(row[column]);
      }
    } else {
      results = {};
      for (const row of queryResult) {
        results[row[key]] = row[column];
      }
    }
    return results;
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

  public addSelect(columns: string[] | { [as: string]: any }): this;

  addSelect(columns, ...cols) {
    columns = isArray(columns) ? columns : [columns, ...cols];
    for (const column of columns) {
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

  public distinct(...args) {
    const columns = args;
    if (columns.length > 0) {
      this._distinct = isArray(columns[0]) || isBoolean(columns[0]) ? columns[0] as boolean : columns;
    } else {
      this._distinct = true;
    }
    return this;
  }

  /*Insert a new record and get the value of the primary key.*/
  public insertGetId(values: any, sequence: string = 'id') {
    const sql = this._grammar.compileInsertGetId(this, values, sequence);
    return this._processor.processInsertGetId(
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

  public fromSub(table, as) {
    return this;
  }

  //todo should be promise or callback
  /**
   * get for column is temp used for query
   * @param columns
   */
  public get(columns: string | string[] = ['*']): any[] {
    columns = wrapToArray(columns);
    return this.onceWithColumns(columns, () => {
      return this._processor.processSelect(this, this.runSelect());
    });
  }

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
  public insertUsing(columns: any[], query: Function | QueryBuilder | string) {
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

  //todo
  isQueryable(value): value is (QueryBuilder | Function) {
    return value instanceof QueryBuilder ||
      // value instanceof EloquentBuilder ||
      // value instanceof Relation ||
      isFunction(value);
  }

  public newQuery(): this {
    // @ts-ignore
    return new QueryBuilder(this._connection, this._grammar, this._processor);
  }

  runSelect() {
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

  public select(...col: string[]): this;

  public select(columns: string[] | { [as: string]: any }): this;

  public select(columns, ...cols): this {
    this._columns            = [];
    this._bindings['select'] = [];

    columns = isArray(columns) ? columns : [columns, ...cols];
    this.addSelect(columns);
    return this;
  }


  /*Update a record in the database.*/
  public update(values: any) {
    const sql = this._grammar.compileUpdate(this, values);
    return this._connection.update(sql,
      this.getBindings()
    );
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
    return this._connection.delete(
      this._grammar.compileDelete(this),
      this.getBindings()
    );
  }

  /*Run a truncate statement on the table.*/
  public truncate() {
    for (const [sql, bindings] of Object.entries(this._grammar.compileTruncate(this))) {
      this._connection.statement(sql, this.getBindings());
    }
  }

  /*Insert or update a record matching the attributes, and fill it with values.*/
  public updateOrInsert(attributes: object, values: object = {}) {
    if (!this.where(attributes).exists()) {
      return this.insert({ ...attributes, ...values });
    }
    if (isAnyEmpty(values)) {
      return true;
    }
    return this.limit(1).update(values);
  }

  public insert(values: any) {
    if (isArray(values)) {
      throw new Error('invalid values');
    }
    if (isAnyEmpty(values)) {
      return true;
    }
    if (!this._from) {
      throw new Error('must call from before insert');
    }
    // if (!isArray(values)) {
    //    values = [values];
    // } else {
    //   // for (let [key, value] of Object.entries(values)) {
    //   //   values[key] = value;
    //   // }
    //   throw new Error('not implement yet')
    // }

    // const insertValues = Object.values(values)
    return this._connection.insert(
      this._grammar.compileInsert(this, values),
      this.getBindings()
      // this._cleanBindings(insertValues)
    );
  }

  // protected _cleanBindings(bindings: any[]) {
  //   return bindings.filter(it=>!(it instanceof RawExpression))
  // }

  selectSub(query: Function | QueryBuilder | string, as: string) {
    let columnAsNode;
    if (isString(as)) {
      columnAsNode = SqlParser.createSqlParser(as).parseAsName();
    }

    return this._columns = [
      new ColumnReferenceExpression(
        this._createSubQuery('select', query),
        columnAsNode
      )
    ];
  }

  lock(value: boolean | string = true) {
    this._lock = value;
    if (!isBlank(this.lock)) {
      this.useWriteConnection();
    }
    return this;
  }

  toSql() {
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
    return isBlank(value) && this.operators.includes(operator) && !['=', '<>', '!='].includes(operator);
  }

  protected onceWithColumns(columns: string[], callback: () => any[]): any[] {
    const original = this._columns;
    //todo check
    if (original.length === 0) {
      this._columns = columns.map(it => new ColumnReferenceExpression(
        new PathExpression(
          [createIdentifier(it)]
        )
      ));
    }
    const result  = callback();
    this._columns = original;

    //todo temp fix array
    return wrapToArray(result);
  }
}

export class JoinQueryBuilder extends QueryBuilder {
  /*The type of join being performed.*/
  public type: string;
  /*The table the join clause is joining to.*/
  public table: string | TableReferenceExpression;


  /*Create a new join clause instance.*/
  public constructor(parentQuery: QueryBuilder, type: string, table: string | TableReferenceExpression) {
    super(parentQuery.getConnection(), parentQuery.getGrammar(), parentQuery.getProcessor());
    this.type  = type;
    this.table = table;
  }

  /*Get a new instance of the join clause builder.*/
  public newQuery() {
    return new JoinQueryBuilder(this.newParentQuery(), this.type, this.table);
  }

  /*Add an "on" clause to the join.

  On clauses can be chained, e.g.

  $join->on('contacts.user_id', '=', 'users.id')
  ->on('contacts.info_id', '=', 'info.id')

  will produce the following SQL:

  on `contacts`.`user_id` = `users`.`id` and `contacts`.`info_id` = `info`.`id`*/
  public on(first: (query?) => any | string,
            operator?: string,
            second?: string,
            conjunction: 'and' | 'or' = 'and') {
    if (isFunction(first)) {
      return this.whereNested(first, conjunction);
    }
    return this.whereColumn(first, operator, second, conjunction);
  }

  /*Add an "or on" clause to the join.*/
  public orOn(first: (query?) => any | string, operator: string | null = null, second: string | null = null) {
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