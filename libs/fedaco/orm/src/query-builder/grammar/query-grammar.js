/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { isAnyEmpty, isArray, isString } from '@gradii/check-type'
import { BaseGrammar } from '../../base-grammar'
import { AssignmentSetClause } from '../../query/ast/assignment-set-clause'
import { BinaryUnionQueryExpression } from '../../query/ast/binary-union-query-expression'
import { DeleteSpecification } from '../../query/ast/delete-specification'
import { ConditionExpression } from '../../query/ast/expression/condition-expression'
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression'
import { ParenthesizedExpression } from '../../query/ast/expression/parenthesized-expression'
import { FromClause } from '../../query/ast/from-clause'
import { FromTable } from '../../query/ast/from-table'
import { GroupByClause } from '../../query/ast/group-by-clause'
import { HavingClause } from '../../query/ast/having-clause'
import { InsertSpecification } from '../../query/ast/insert-specification'
import { JoinExpression } from '../../query/ast/join-expression'
import { JoinedTable } from '../../query/ast/joined-table'
import { LimitClause } from '../../query/ast/limit-clause'
import { LockClause } from '../../query/ast/lock-clause'
import { OffsetClause } from '../../query/ast/offset-clause'
import { OrderByClause } from '../../query/ast/order-by-clause'
import { QuerySpecification } from '../../query/ast/query-specification'
import { SelectClause } from '../../query/ast/select-clause'
import { SelectScalarExpression } from '../../query/ast/select-scalar-expression'
import { TableReferenceExpression } from '../../query/ast/table-reference-expression'
import { UpdateSpecification } from '../../query/ast/update-specification'
import { ValuesInsertSource } from '../../query/ast/values-insert-source'
import { WhereClause } from '../../query/ast/where-clause'
import { SqlParser } from '../../query/parser/sql-parser'
import { bindingVariable, createIdentifier, raw } from '../ast-factory'
import { QueryBuilderVisitor } from '../visitor/query-builder-visitor'
export class QueryGrammar extends BaseGrammar {
  constructor() {
    super()
    this._selectComponents = [
      'aggregate',
      'columns',
      'from',
      'joins',
      'wheres',
      'groups',
      'havings',
      'orders',
      'limit',
      'offset',
      'lock',
    ]
  }
  _prepareUpdateAst(builder, values) {
    const columnNodes = []
    for (const [key, value] of Object.entries(values)) {
      const columnNode = SqlParser.createSqlParser(key).parseColumnWithoutAlias(
        builder._from
      )
      columnNodes.push(
        new AssignmentSetClause(columnNode, bindingVariable(value, 'update'))
      )
    }
    const ast = new UpdateSpecification(
      builder._from,
      columnNodes,
      builder._wheres.length > 0
        ? new WhereClause(new ConditionExpression(builder._wheres))
        : undefined
    )
    if (builder._joins.length > 0) {
      ast.fromClause = new FromClause(builder._from, builder._joins)
    }
    if (builder._limit >= 0) {
      ast.limitClause = new LimitClause(builder._limit)
    }
    if (builder._offset >= 0) {
      ast.offsetClause = new OffsetClause(builder._offset)
    }
    if (builder._orders.length > 0) {
      ast.orderByClause = new OrderByClause(builder._orders)
    }
    return ast
  }
  compileAggregateFragment(aggregateFunctionName, aggregateColumns, visitor) {
    return ``
  }

  compileDelete(query) {
    let ast
    if (query._joins.length > 0) {
      ast = this._prepareDeleteAstWithJoins(query)
    } else {
      ast = this._prepareDeleteAstWithoutJoins(query)
    }
    const visitor = this._createVisitor(query)
    return ast.accept(visitor)
  }
  compileExists(builder) {
    return `SELECT exists(${this.compileSelect(builder)}) AS \`exists\``
  }
  compileInsert(builder, values, insertOption = 'into') {
    const visitor = this._createVisitor(builder)
    if (isAnyEmpty(values)) {
      return 'INSERT INTO ' + builder._from.accept(visitor) + ' DEFAULT VALUES'
    }

    let keys
    if (!isArray(values)) {
      values = [values]
    }
    if (values.length > 0) {
      keys = Object.keys(values[0])
    }
    const sources = values.map((it) => Object.values(it))
    const ast = new InsertSpecification(
      insertOption,
      new ValuesInsertSource(
        false,
        sources.map((columnValues) => {
          return columnValues.map((it) => bindingVariable(it, 'insert'))
        })
      ),
      keys.map((it) => {
        return SqlParser.createSqlParser(it).parseColumnAlias()
      }),
      builder._from
    )
    return ast.accept(visitor)
  }
  compileInsertGetId(builder, values, sequence) {
    return this.compileInsert(builder, values)
  }
  compileInsertOrIgnore(builder, values) {
    return this.compileInsert(builder, values, 'ignore into')
  }
  compileInsertUsing(builder, columns, nestedExpression) {
    const ast = new InsertSpecification(
      'into',
      new ValuesInsertSource(false, [], nestedExpression),
      columns.map((it) => {
        return SqlParser.createSqlParser(it).parseColumnAlias()
      }),
      builder._from
    )
    const visitor = this._createVisitor(builder)
    return ast.accept(visitor)
  }
  compileJoinFragment(builder, visitor) {
    let whereClause
    if (builder._wheres.length > 0) {
      whereClause = new ConditionExpression(builder._wheres)
    }
    let table
    if (isString(builder.table)) {
      table = SqlParser.createSqlParser(builder.table).parseTableAlias()
    } else if (builder.table instanceof TableReferenceExpression) {
      table = builder.table
    } else {
      throw new Error('invalid table')
    }
    if (builder._joins.length > 0) {
      table = new JoinedTable(table, builder._joins)
    }
    const ast = new JoinExpression(builder.type, table, whereClause)
    return ast.accept(visitor)
  }
  compileNestedPredicate(builder, visitor) {
    const ast = new ParenthesizedExpression(
      new ConditionExpression(builder._wheres)
    )
    return ast.accept(visitor)
  }
  compileSelect(builder) {
    return ''
  }
  wrapUnion(sql) {
    return '(' + sql + ')'
  }
  compileUnionAggregate(builder) {
    return ''
  }
  concatenate(segments) {
    return ''
  }
  compileUnions(builder) {
    return ''
  }

  compileComponents(builder) {
    const sql = []

    return ''
  }
  compileTruncate(builder) {
    return {
      [`TRUNCATE TABLE ${builder._from.accept(this._createVisitor(builder))}`]:
        builder.getBindings(),
    }
  }
  compileUpdate(builder, values) {
    const ast = this._prepareUpdateAst(builder, values)
    const visitor = this._createVisitor(builder)
    return ast.accept(visitor)
  }
  compileUpsert(builder, values, uniqueBy, update) {
    throw new Error(
      'RuntimeException This database engine does not support upserts.'
    )
  }
  compilePredicateFuncName(funcName) {
    if (funcName === 'JsonContains') {
      return 'json_contains'
    }
    return funcName
  }
  distinct(distinct) {
    return ''
  }
  getOperators() {
    return []
  }
  prepareBindingsForUpdate(builder, visitor) {
    return ''
  }
  prepareBindingForJsonContains(value) {
    return JSON.stringify(value)
  }
  quoteColumnName(columnName) {
    return ''
  }
  quoteSchemaName(schemaName) {
    return schemaName
  }
  quoteTableName(tableName) {
    return tableName
  }
  setTablePrefix(prefix) {
    return this
  }
  wrap(column) {
    if (column === '*') {
      return '*'
    }
    return this.quoteColumnName(column.replace(/\s|'|"|`/g, ''))
  }
  _prepareAggregateAst(builder, ast) {
    if (builder._unions.length > 0) {
      if (builder._aggregate) {
        ast = new QuerySpecification(
          new SelectClause([
            new SelectScalarExpression(
              new FunctionCallExpression(
                builder._aggregate.aggregateFunctionName,
                builder._aggregate.aggregateColumns
              ),
              createIdentifier('aggregate')
            ),
          ]),
          new FromClause(
            new FromTable(
              new TableReferenceExpression(
                new ParenthesizedExpression(ast),
                createIdentifier('temp_table')
              )
            )
          )
        )
      }
    }
    return ast
  }
  _prepareSelectAst(builder) {
    let whereClause, selectClause
    if (builder._wheres.length > 0) {
      whereClause = new WhereClause(new ConditionExpression(builder._wheres))
    }
    if (builder._aggregate && builder._unions.length === 0) {
      selectClause = new SelectClause(
        [
          new SelectScalarExpression(
            new FunctionCallExpression(
              builder._aggregate.aggregateFunctionName,
              builder._aggregate.aggregateColumns
            ),
            createIdentifier('aggregate')
          ),
        ],
        builder._distinct
      )
    } else {
      selectClause = new SelectClause(builder._columns, builder._distinct)
    }
    let ast = new QuerySpecification(
      selectClause,
      builder._from ? new FromClause(builder._from, builder._joins) : undefined,
      whereClause
    )
    if (builder._limit >= 0) {
      ast.limitClause = new LimitClause(builder._limit)
    }
    if (builder._offset >= 0) {
      ast.offsetClause = new OffsetClause(builder._offset)
    }
    if (builder._orders.length > 0) {
      ast.orderByClause = new OrderByClause(builder._orders)
    }
    if (builder._groups.length > 0) {
      ast.groupByClause = new GroupByClause(builder._groups)
    }
    if (builder._havings.length > 0) {
      ast.havingClause = new HavingClause(builder._havings)
    }
    if (builder._lock !== undefined) {
      ast.lockClause = new LockClause(builder._lock)
    }
    if (builder._unions.length > 0) {
      for (const it of builder._unions) {
        const rightSql = it.expression.toSql()
        const bindings = it.expression.getBindings()
        builder.addBinding(bindings, 'union')
        ast = new BinaryUnionQueryExpression(ast, raw(rightSql), it.all)
      }
      if (builder._unionLimit >= 0) {
        ast.limitClause = new LimitClause(builder._unionLimit)
      }
      if (builder._unionOffset >= 0) {
        ast.offsetClause = new OffsetClause(builder._unionOffset)
      }
      if (builder._unionOrders.length > 0) {
        ast.orderByClause = new OrderByClause(builder._unionOrders)
      }
    }

    ast = this._prepareAggregateAst(builder, ast)
    return ast
  }
  _createVisitor(queryBuilder) {
    return new QueryBuilderVisitor(queryBuilder._grammar, queryBuilder)
  }

  _prepareDeleteAstWithoutJoins(builder) {
    return this._prepareDeleteAstWithJoins(builder)
  }

  _prepareDeleteAstWithJoins(builder) {
    const ast = new DeleteSpecification(
      builder._from,
      builder._wheres.length > 0
        ? new WhereClause(new ConditionExpression(builder._wheres))
        : undefined
    )
    if (builder._joins.length > 0) {
      ast.fromClause = new FromClause(builder._from, builder._joins)
    }
    if (builder._limit >= 0) {
      ast.limitClause = new LimitClause(builder._limit)
    }
    if (builder._offset >= 0) {
      ast.offsetClause = new OffsetClause(builder._offset)
    }
    if (builder._orders.length > 0) {
      ast.orderByClause = new OrderByClause(builder._orders)
    }
    return ast
  }
  getDateFormat() {
    return 'yyyy-MM-dd HH:mm:ss'
  }

  supportsSavepoints() {
    return true
  }
  compileSavepoint(name) {
    return 'SAVEPOINT ' + name
  }

  compileSavepointRollBack(name) {
    return `ROLLBACK TO SAVEPOINT ${name}`
  }
}
