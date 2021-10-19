import { __awaiter } from 'tslib'
import {
  isAnyEmpty,
  isArray,
  isBlank,
  isBoolean,
  isFunction,
  isNumber,
  isString,
} from '@gradii/check-type'
import { FedacoBuilder } from '../fedaco/fedaco-builder'
import { Relation } from '../fedaco/relations/relation'
import { ColumnReferenceExpression } from '../query/ast/column-reference-expression'
import { ComparisonPredicateExpression } from '../query/ast/expression/comparison-predicate-expression'
import { RawExpression } from '../query/ast/expression/raw-expression'
import { NestedPredicateExpression } from '../query/ast/fragment/expression/nested-predicate-expression'
import { NestedExpression } from '../query/ast/fragment/nested-expression'
import { FromTable } from '../query/ast/from-table'
import { PathExpression } from '../query/ast/path-expression'
import { TableReferenceExpression } from '../query/ast/table-reference-expression'
import { SqlParser } from '../query/parser/sql-parser'
import {
  bindingVariable,
  createIdentifier,
  raw,
  rawSqlBindings,
} from './ast-factory'
import { wrapToArray } from './ast-helper'
import { Builder } from './builder'
export var BindingType
;(function (BindingType) {
  BindingType['where'] = 'where'
  BindingType['join'] = 'join'
})(BindingType || (BindingType = {}))
export class QueryBuilder extends Builder {
  constructor(connection, grammar, processor = null) {
    super()

    this.operators = [
      '=',
      '<',
      '>',
      '<=',
      '>=',
      '<>',
      '!=',
      '<=>',
      'like',
      'like binary',
      'not like',
      'ilike',
      '&',
      '|',
      '^',
      '<<',
      '>>',
      'rlike',
      'not rlike',
      'regexp',
      'not regexp',
      '~',
      '~*',
      '!~',
      '!~*',
      'similar to',
      'not similar to',
      'not ilike',
      '~~*',
      '!~~*',
    ]

    this._useWriteConnection = false
    this._connection = connection

    this._grammar = grammar
    this._processor = processor
    this._sqlParser = new SqlParser()
  }

  _forSubQuery() {
    return this.newQuery()
  }
  clone() {
    const cloned = this.newQuery()
    cloned._sqlParser = this._sqlParser

    cloned._aggregate = this._aggregate
    cloned._columns = [...this._columns]
    cloned._distinct = this._distinct
    cloned._from = this._from
    cloned._joins = [...this._joins]
    cloned._wheres = [...this._wheres]
    cloned._groups = [...this._groups]
    cloned._havings = [...this._havings]
    cloned._orders = [...this._orders]
    cloned._limit = this._limit
    cloned._offset = this._offset
    cloned._unions = [...this._unions]
    cloned._unionLimit = this._unionLimit
    cloned._unionOffset = this._unionOffset
    cloned._lock = this._lock
    cloned._beforeQueryCallbacks = [...this._beforeQueryCallbacks]
    return cloned
  }

  cloneWithout(properties) {
    const cloned = this.clone()
    for (const property of properties) {
      cloned[property] = isArray(cloned[property]) ? [] : undefined
    }
    return cloned
  }
  _prepareValueAndOperator(value, operator, useDefault) {
    if (useDefault) {
      return [operator, '=']
    } else if (this._invalidOperatorAndValue(operator, value)) {
      throw new Error(
        'InvalidArgumentException Illegal operator and value combination.'
      )
    }
    return [value, operator]
  }
  _invalidOperator(operator) {
    if (isString(operator)) {
      return (
        !this.operators.includes(operator.toLowerCase()) &&
        !this._grammar.getOperators().includes(operator.toLowerCase())
      )
    }
    return false
  }
  _newJoinClause(parentQuery, type, table) {
    return new JoinClauseBuilder(parentQuery, type, table)
  }

  _createSubQuery(type, query) {
    if (isFunction(query)) {
      query((query = this._forSubQuery()))
    }
    return this._parseSub(type, query)
  }
  _createSubPredicate(query) {
    if (isFunction(query)) {
      query((query = this._forSubQuery()))
    } else if (isString(query)) {
      return new NestedPredicateExpression(query)
    }
    return new NestedPredicateExpression(query)
  }

  _parseSub(type, query) {
    if (query instanceof QueryBuilder) {
      return new NestedExpression(type, query.toSql(), query.getBindings())
    } else if (query instanceof FedacoBuilder) {
      const { result: sql, bindings } = query.toSql()
      return new NestedExpression(type, sql, bindings)
    } else if (isString(query)) {
      return new NestedExpression(type, query, [])
    } else {
      throw new Error(
        'InvalidArgumentException A subquery must be a query builder instance, a Closure, or a string.'
      )
    }
  }
  _selectAs(columns, as) {
    if (arguments.length === 2) {
      this._columns.push(
        new ColumnReferenceExpression(
          new PathExpression([createIdentifier(columns)]),
          createIdentifier(as)
        )
      )
    } else {
      for (const [_as, _column] of Object.entries(columns)) {
        if (this.isQueryable(_column)) {
          this.selectSub(_column, _as)
        } else {
          throw new Error(`column is not queryable ${_column}`)
        }
      }
    }
    return this
  }
  find(id, columns = ['*']) {
    return this.where('id', '=', id).first(columns)
  }

  pluck(column, key) {
    return __awaiter(this, void 0, void 0, function* () {
      const queryResult = yield this.onceWithColumns(
        isBlank(key) ? [column] : [column, key],
        () =>
          __awaiter(this, void 0, void 0, function* () {
            return this._processor.processSelect(this, yield this.runSelect())
          })
      )
      column = this.stripTableForPluck(column)
      key = this.stripTableForPluck(key)
      return this.pluckFromColumn(queryResult, column, key)
    })
  }
  mergeWheres(_wheres, bindings) {
    this._wheres = this._wheres.concat(_wheres)
    if (typeof bindings === 'object') {
      bindings = Object.values(bindings)
    }
    this._bindings['where'] = this._bindings['where'].concat(bindings)
  }

  stripTableForPluck(column) {
    if (isBlank(column)) {
      return column
    }
    const separator = column.toLowerCase().indexOf(' as ') > -1 ? ' as ' : '\\.'
    return column.split(new RegExp(separator, 'ig')).pop()
  }

  pluckFromColumn(queryResult, column, key) {
    if (isBlank(key)) {
      const results = []
      for (const row of queryResult) {
        results.push(row[column])
      }
      return results
    } else {
      const results = {}
      for (const row of queryResult) {
        results[row[key]] = row[column]
      }
      return results
    }
  }
  addBinding(value, type = 'where') {
    if (!this._bindings[type]) {
      throw new Error(`InvalidArgumentException Invalid binding type: ${type}.`)
    }
    if (isArray(value)) {
      this._bindings[type] = [...this._bindings[type], ...value]
    } else {
      this._bindings[type].push(value)
    }
    return this
  }
  addSelect(columns, ...cols) {
    columns = isArray(columns) ? columns : arguments
    for (const column of columns) {
      if (column instanceof RawExpression) {
        this._columns.push(column)
      } else if (isString(column)) {
        const _column = SqlParser.createSqlParser(column).parseColumnAlias()
        this._columns.push(_column)
      } else if (column instanceof ColumnReferenceExpression) {
        this._columns.push(column)
      }
    }
    return this
  }
  distinct(...args) {
    const columns = args
    if (columns.length > 0) {
      this._distinct =
        isArray(columns[0]) || isBoolean(columns[0]) ? columns[0] : columns
    } else {
      this._distinct = true
    }
    return this
  }

  insertGetId(values, sequence = 'id') {
    return __awaiter(this, void 0, void 0, function* () {
      this.applyBeforeQueryCallbacks()
      const sql = this._grammar.compileInsertGetId(this, values, sequence)
      return this._processor.processInsertGetId(
        this,
        sql,
        this.getBindings(),
        sequence
      )
    })
  }
  from(table, as) {
    if (this.isQueryable(table)) {
      return this.fromSub(table, as)
    }
    if (table instanceof RawExpression) {
      this._from = new FromTable(table)
    } else {
      const from = as ? `${table} as ${as}` : table
      this._from = new FromTable(
        SqlParser.createSqlParser(from).parseTableAlias()
      )
    }
    return this
  }
  fromSub(table, as) {
    if (table instanceof QueryBuilder || isFunction(table)) {
      this._from = new FromTable(
        new TableReferenceExpression(
          this._createSubQuery('from', table),
          createIdentifier(as)
        )
      )
    } else if (isString(table)) {
      this.from(table)
    } else {
      throw new Error('InvalidArgumentException')
    }
    return this
  }

  get(columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      columns = wrapToArray(columns)
      return yield this.onceWithColumns(columns, () =>
        __awaiter(this, void 0, void 0, function* () {
          return this._processor.processSelect(this, yield this.runSelect())
        })
      )
    })
  }

  getBindings() {
    const rst = []
    for (const item of Object.values(this._bindings)) {
      for (const it of item) {
        rst.push(it)
      }
    }
    return rst
  }
  getConnection() {
    return this._connection
  }

  insertUsing(columns, query) {
    return __awaiter(this, void 0, void 0, function* () {
      this.applyBeforeQueryCallbacks()
      if (!this.isQueryable(query)) {
        throw new Error('InvalidArgumentException')
      }
      const node = this._createSubQuery('insert', query)
      return this._connection.affectingStatement(
        this._grammar.compileInsertUsing(this, columns, node),
        this.getBindings()
      )
    })
  }

  insertOrIgnore(values) {
    if (isAnyEmpty(values)) {
      return 0
    }
    this.applyBeforeQueryCallbacks()
    return this._connection.affectingStatement(
      this._grammar.compileInsertOrIgnore(this, values),
      this.getBindings()
    )
  }
  getGrammar() {
    return this._grammar
  }
  getProcessor() {
    return this._processor
  }
  getRawBindings() {
    return this._bindings
  }
  isQueryable(value) {
    return (
      value instanceof QueryBuilder ||
      value instanceof FedacoBuilder ||
      value instanceof Relation ||
      isFunction(value)
    )
  }
  newQuery() {
    return new QueryBuilder(this._connection, this._grammar, this._processor)
  }
  runSelect() {
    return __awaiter(this, void 0, void 0, function* () {
      return this._connection.select(
        this.toSql(),
        this.getBindings(),
        !this._useWriteConnection
      )
    })
  }

  selectRaw(expression, bindings = []) {
    this._columns.push(rawSqlBindings(expression, bindings))

    return this
  }
  select(columns, ...cols) {
    this._columns = []
    this._bindings['select'] = []
    columns = isArray(columns) ? columns : [columns, ...cols]
    this.addSelect(columns)
    return this
  }

  update(values = {}) {
    return __awaiter(this, void 0, void 0, function* () {
      this.applyBeforeQueryCallbacks()
      const sql = this._grammar.compileUpdate(this, values)
      return yield this._connection.update(sql, this.getBindings())
    })
  }

  increment(column, amount = 1, extra = {}) {
    if (!isNumber(amount)) {
      throw new Error(
        'InvalidArgumentException Non-numeric value passed to increment method.'
      )
    }
    const wrapped = this._grammar.wrap(column)
    const columns = Object.assign(
      { [column]: raw(`${wrapped} + ${amount}`) },
      extra
    )
    return this.update(columns)
  }

  decrement(column, amount = 1, extra = {}) {
    if (!isNumber(amount)) {
      throw new Error(
        'InvalidArgumentException Non-numeric value passed to decrement method.'
      )
    }
    const wrapped = this._grammar.wrap(column)
    const columns = Object.assign(
      { [column]: raw(`${wrapped} - ${amount}`) },
      extra
    )
    return this.update(columns)
  }

  delete(id) {
    if (!isBlank(id)) {
      this.addWhere(
        new ComparisonPredicateExpression(
          new ColumnReferenceExpression(
            new PathExpression([this._from, createIdentifier('id')])
          ),
          '=',
          bindingVariable(id)
        )
      )
    }
    this.applyBeforeQueryCallbacks()
    return this._connection.delete(
      this._grammar.compileDelete(this),
      this.getBindings()
    )
  }

  truncate() {
    this.applyBeforeQueryCallbacks()
    for (const [sql, bindings] of Object.entries(
      this._grammar.compileTruncate(this)
    )) {
      this._connection.statement(sql, this.getBindings())
    }
  }

  updateOrInsert(attributes, values = {}) {
    return __awaiter(this, void 0, void 0, function* () {
      if (isBlank(this._from)) {
        throw new Error('must call from before insert')
      }
      if (!(yield this.where(attributes).exists())) {
        return yield this.insert(
          Object.assign(Object.assign({}, attributes), values)
        )
      }
      if (isAnyEmpty(values)) {
        return true
      }
      return yield this.limit(1).update(values)
    })
  }

  upsert(values, uniqueBy, update = null) {
    if (!values.length) {
      return 0
    } else if (update === []) {
      return this.insert(values)
    }
    if (!isArray(values)) {
      values = [values]
    }
    if (isBlank(update)) {
      update = Object.keys(values[0])
    }
    this.applyBeforeQueryCallbacks()

    return this._connection.affectingStatement(
      this._grammar.compileUpsert(this, values, uniqueBy, update),
      this.getBindings()
    )
  }
  insert(values) {
    return __awaiter(this, void 0, void 0, function* () {
      if (isBlank(values)) {
        return true
      }
      if (!isArray(values)) {
        values = [values]
      } else {
      }
      this.applyBeforeQueryCallbacks()
      return this._connection.insert(
        this._grammar.compileInsert(this, values),
        this.getBindings()
      )
    })
  }

  selectSub(query, as) {
    let columnAsNode
    if (isString(as)) {
      columnAsNode = SqlParser.createSqlParser(as).parseAsName()
    }
    return this._columns.push(
      new ColumnReferenceExpression(
        this._createSubQuery('select', query),
        columnAsNode
      )
    )
  }
  lock(value = true) {
    this._lock = value
    if (!isBlank(this.lock)) {
      this.useWriteConnection()
    }
    return this
  }

  beforeQuery(callback) {
    this._beforeQueryCallbacks.push(callback)
    return this
  }

  applyBeforeQueryCallbacks() {
    for (const callback of this._beforeQueryCallbacks) {
      callback(this)
    }
    this._beforeQueryCallbacks = []
  }
  toSql() {
    this.applyBeforeQueryCallbacks()
    this.resetBindings()
    return this._grammar.compileSelect(this)
  }
  resetBindings() {
    for (const it of Object.keys(this._bindings)) {
      this._bindings[it] = []
    }
  }
  useReadConnection() {
    this._useWriteConnection = false
    return this
  }
  useWriteConnection() {
    this._useWriteConnection = true
    return this
  }

  _invalidOperatorAndValue(operator, value) {
    return (
      isBlank(value) &&
      this.operators.includes(operator) &&
      !['=', '<>', '!='].includes(operator)
    )
  }
  onceWithColumns(columns, callback) {
    return __awaiter(this, void 0, void 0, function* () {
      const original = this._columns

      if (original.length === 0) {
        this._columns = columns.map((it) =>
          SqlParser.createSqlParser(it).parseColumnAlias()
        )
      }
      const result = yield callback()
      this._columns = original

      return wrapToArray(result)
    })
  }
}
export class JoinClauseBuilder extends QueryBuilder {
  constructor(parentQuery, type, table) {
    super(
      parentQuery.getConnection(),
      parentQuery.getGrammar(),
      parentQuery.getProcessor()
    )
    this.type = type
    this.table = table
  }

  newQuery() {
    return new JoinClauseBuilder(this.newParentQuery(), this.type, this.table)
  }

  on(first, operator, second, conjunction = 'and') {
    if (isFunction(first)) {
      return this.whereNested(first, conjunction)
    }
    return this.whereColumn(first, operator, second, conjunction)
  }

  orOn(first, operator = null, second = null) {
    return this.on(first, operator, second, 'or')
  }

  forSubQuery() {
    return this.newParentQuery().newQuery()
  }

  newParentQuery() {
    return super.newQuery()
  }
}
