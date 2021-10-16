import { ColumnReferenceExpression } from '../../query/ast/column-reference-expression'
import { DeleteSpecification } from '../../query/ast/delete-specification'
import { ConditionExpression } from '../../query/ast/expression/condition-expression'
import { InPredicateExpression } from '../../query/ast/expression/in-predicate-expression'
import { NestedExpression } from '../../query/ast/fragment/nested-expression'
import { Identifier } from '../../query/ast/identifier'
import { PathExpression } from '../../query/ast/path-expression'
import { WhereClause } from '../../query/ast/where-clause'
import { createIdentifier } from '../ast-factory'
import { SqliteQueryBuilderVisitor } from '../visitor/sqlite-query-builder-visitor'
import { QueryGrammar } from './query-grammar'
export class SqliteQueryGrammar extends QueryGrammar {
  constructor() {
    super(...arguments)
    this._tablePrefix = ''
  }
  compileJoins() {}
  _createVisitor(queryBuilder) {
    return new SqliteQueryBuilderVisitor(queryBuilder._grammar, queryBuilder)
  }
  compileInsertOrIgnore(builder, values) {
    return this.compileInsert(builder, values, 'or ignore into')
  }

  compileTruncate(query) {
    const table = query._from.accept(this._createVisitor(query))
    return {
      'DELETE FROM sqlite_sequence WHERE name = ?': [
        this.unQuoteTableName(table),
      ],
      [`DELETE FROM ${table}`]: [],
    }
  }
  compileSelect(builder) {
    const ast = this._prepareSelectAst(builder)
    const visitor = new SqliteQueryBuilderVisitor(builder._grammar, builder)
    return ast.accept(visitor)
  }
  distinct(distinct) {
    if (distinct !== false) {
      return 'DISTINCT'
    } else {
      return ''
    }
  }
  quoteColumnName(columnName) {
    return `"${columnName.replace(/`/g, '')}"`
  }
  quoteTableName(tableName) {
    return `"${this._tablePrefix}${tableName.replace(/`/g, '')}"`
  }
  unQuoteTableName(tableName) {
    return `${tableName.replace(/^"(.+?)"/g, '$1')}`
  }
  setTablePrefix(prefix) {
    this._tablePrefix = prefix
    return this
  }
  _prepareDeleteAstWithJoins(builder) {
    const inBuilder = builder.cloneWithout([])
    inBuilder.resetBindings()
    inBuilder._columns = [
      new ColumnReferenceExpression(
        new PathExpression([builder._from, createIdentifier('rowid')])
      ),
    ]
    inBuilder._wheres = builder._wheres
    const ast = new DeleteSpecification(
      builder._from,
      new WhereClause(
        new ConditionExpression([
          new InPredicateExpression(
            new ColumnReferenceExpression(
              new PathExpression([new Identifier('rowid')])
            ),
            [],
            new NestedExpression('where', inBuilder)
          ),
        ])
      )
    )
    return ast
  }
  _prepareDeleteAstWithoutJoins(builder) {
    return this._prepareDeleteAstWithJoins(builder)
  }
}
