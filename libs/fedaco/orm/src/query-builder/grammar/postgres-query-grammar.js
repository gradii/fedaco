import { snakeCase } from '../../helper/str'
import { AssignmentSetClause } from '../../query/ast/assignment-set-clause'
import { ColumnReferenceExpression } from '../../query/ast/column-reference-expression'
import { DeleteSpecification } from '../../query/ast/delete-specification'
import { ConditionExpression } from '../../query/ast/expression/condition-expression'
import { InPredicateExpression } from '../../query/ast/expression/in-predicate-expression'
import { NestedExpression } from '../../query/ast/fragment/nested-expression'
import { Identifier } from '../../query/ast/identifier'
import { PathExpression } from '../../query/ast/path-expression'
import { UpdateSpecification } from '../../query/ast/update-specification'
import { WhereClause } from '../../query/ast/where-clause'
import { SqlParser } from '../../query/parser/sql-parser'
import { bindingVariable, createIdentifier } from '../ast-factory'
import { PostgresQueryBuilderVisitor } from '../visitor/postgres-query-builder-visitor'
import { QueryBuilderVisitor } from '../visitor/query-builder-visitor'
import { QueryGrammar } from './query-grammar'
export class PostgresQueryGrammar extends QueryGrammar {
  constructor() {
    super(...arguments)
    this._tablePrefix = ''
  }
  compileJoins() {}
  _createVisitor(queryBuilder) {
    return new QueryBuilderVisitor(queryBuilder._grammar, queryBuilder)
  }
  compilePredicateFuncName(funcName) {
    if (funcName === 'JsonLength') {
      return 'json_array_length'
    }
    return snakeCase(funcName)
  }
  compileTruncate(query) {
    return {
      [`TRUNCATE ${query._from.accept(
        this._createVisitor(query)
      )} restart identity cascade`]: [],
    }
  }
  compileSelect(builder) {
    const ast = this._prepareSelectAst(builder)
    const visitor = new PostgresQueryBuilderVisitor(builder._grammar, builder)
    return ast.accept(visitor)
  }
  quoteSchemaName(quoteSchemaName) {
    return `"${quoteSchemaName.replace(/`'"/g, '')}"`
  }
  compileUpdate(builder, values) {
    const ast = this._prepareUpdateAst(builder, values)
    const visitor = new PostgresQueryBuilderVisitor(builder._grammar, builder)
    return ast.accept(visitor)
  }
  distinct(distinct) {
    if (distinct !== false) {
      return 'DISTINCT'
    } else {
      return ''
    }
  }
  compileInsertOrIgnore(builder, values) {
    return (
      this.compileInsert(builder, values, 'into') + ' ON conflict do nothing'
    )
  }

  compileInsertGetId(query, values, sequence = 'id') {
    return `${this.compileInsert(query, values)} returning ${this.wrap(
      sequence
    )}`
  }
  quoteColumnName(columnName) {
    if (columnName === '*') {
      return '*'
    }
    return `"${columnName.replace(/`/g, '')}"`
  }
  quoteTableName(tableName) {
    return `"${this._tablePrefix}${tableName.replace(/`/g, '')}"`
  }
  _prepareUpdateAst(builder, values) {
    if (builder._joins.length > 0) {
      const columnNodes = []
      for (const [key, value] of Object.entries(values)) {
        const columnNode = SqlParser.createSqlParser(key).parseColumnAlias()
        columnNodes.push(
          new AssignmentSetClause(columnNode, bindingVariable(value, 'update'))
        )
      }
      const inBuilder = builder.cloneWithout([])
      inBuilder.resetBindings()
      inBuilder._columns = [
        new ColumnReferenceExpression(
          new PathExpression([builder._from, createIdentifier('ctid')])
        ),
      ]
      const ast = new UpdateSpecification(
        builder._from,
        columnNodes,
        new WhereClause(
          new ConditionExpression([
            new InPredicateExpression(
              new ColumnReferenceExpression(
                new PathExpression([new Identifier('ctid')])
              ),
              [],
              new NestedExpression('where', inBuilder)
            ),
          ])
        )
      )
      return ast
    }
    return super._prepareUpdateAst(builder, values)
  }
  _prepareDeleteAstWithJoins(builder) {
    if (builder._joins.length > 0) {
      const inBuilder = builder.cloneWithout([])
      inBuilder.resetBindings()
      inBuilder._columns = [
        new ColumnReferenceExpression(
          new PathExpression([builder._from, createIdentifier('ctid')])
        ),
      ]
      const ast = new DeleteSpecification(
        builder._from,
        new WhereClause(
          new ConditionExpression([
            new InPredicateExpression(
              new ColumnReferenceExpression(
                new PathExpression([new Identifier('ctid')])
              ),
              [],
              new NestedExpression('where', inBuilder)
            ),
          ])
        )
      )
      return ast
    }
    return super._prepareDeleteAstWithJoins(builder)
  }
  setTablePrefix(prefix) {
    this._tablePrefix = prefix
    return this
  }
}
