import { isBoolean } from '@gradii/check-type'
import { snakeCase } from '../../helper/str'
import { DeleteSpecification } from '../../query/ast/delete-specification'
import { ConditionExpression } from '../../query/ast/expression/condition-expression'
import { FromClause } from '../../query/ast/from-clause'
import { OffsetClause } from '../../query/ast/offset-clause'
import { WhereClause } from '../../query/ast/where-clause'
import { SqlserverQueryBuilderVisitor } from '../visitor/sqlserver-query-builder-visitor'
import { QueryGrammar } from './query-grammar'
export class SqlserverQueryGrammar extends QueryGrammar {
  constructor() {
    super(...arguments)
    this._tablePrefix = ''
  }
  compileSelect(builder) {
    const ast = this._prepareSelectAst(builder)
    const visitor = new SqlserverQueryBuilderVisitor(builder._grammar, builder)
    return ast.accept(visitor)
  }
  compileUpdate(builder, values) {
    const ast = this._prepareUpdateAst(builder, values)
    const visitor = new SqlserverQueryBuilderVisitor(builder._grammar, builder)
    return ast.accept(visitor)
  }
  compileInsertOrIgnore(builder, values) {
    throw new Error('RuntimeException')
  }
  compilePredicateFuncName(funcName) {
    return snakeCase(funcName)
  }
  distinct(distinct) {
    if (distinct !== false) {
      return 'DISTINCT'
    } else {
      return ''
    }
  }
  prepareBindingForJsonContains(value) {
    return isBoolean(value) ? JSON.stringify(value) : value
  }
  quoteColumnName(columnName) {
    if (columnName === '*') {
      return '*'
    }
    return `[${columnName.replace(/`/g, '')}]`
  }
  quoteTableName(tableName) {
    return `[${this._tablePrefix}${tableName.replace(/`/g, '')}]`
  }
  setTablePrefix(prefix) {
    this._tablePrefix = prefix
    return this
  }
  compileInsertGetId(builder, values, sequence) {
    return `set nocount on;${super.compileInsertGetId(
      builder,
      values,
      sequence
    )};select scope_identity() as ${this.wrap(sequence)}`
  }
  _createVisitor(queryBuilder) {
    return new SqlserverQueryBuilderVisitor(queryBuilder._grammar, queryBuilder)
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
      ast.topRow = builder._limit
    }
    if (builder._offset >= 0) {
      ast.offsetClause = new OffsetClause(builder._offset)
    }

    return ast
  }
}
