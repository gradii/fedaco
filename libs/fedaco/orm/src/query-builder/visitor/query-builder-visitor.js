/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import {
  isArray,
  isBlank,
  isBoolean,
  isNumber,
  isString,
} from '@gradii/check-type'
import { uniq } from 'ramda'
import { BinaryUnionQueryExpression } from '../../query/ast/binary-union-query-expression'
import { BindingVariable } from '../../query/ast/binding-variable'
import { RawExpression } from '../../query/ast/expression/raw-expression'
import { Identifier } from '../../query/ast/identifier'
import { JoinedTable } from '../../query/ast/joined-table'
import { JsonPathExpression } from '../../query/ast/json-path-expression'
import { PathExpression } from '../../query/ast/path-expression'
import { TableName } from '../../query/ast/table-name'
import { resolveIdentifier } from '../ast-helper'
import { resolveForwardRef } from '../forward-ref'
import { QueryBuilder } from '../query-builder'
export class QueryBuilderVisitor {
  constructor(
    _grammar,

    _queryBuilder
  ) {
    this._grammar = _grammar
    this._queryBuilder = _queryBuilder
    this.inJoinExpression = false
  }
  visit() {
    return 'hello'
  }
  visitAggregateFragment(node) {
    throw new Error('not implement yet')
  }
  visitAsExpression(node) {
    return `${node.name.accept(this)} AS ${node.as.accept(this)}`
  }
  visitDeleteSpecification(node) {
    let sql = `DELETE FROM ${node.target.accept(this)}`
    if (node.fromClause) {
      sql += ` ${node.fromClause.accept(this)}`
    }
    if (node.whereClause) {
      sql += ` ${node.whereClause.accept(this)}`
    }
    if (node.orderByClause) {
      sql += ` ${node.orderByClause.accept(this)}`
    }
    if (node.offsetClause) {
      sql += ` ${node.offsetClause.accept(this)}`
    }
    if (node.limitClause) {
      sql += ` ${node.limitClause.accept(this)}`
    }
    return sql
  }
  visitAssignmentSetClause(node) {
    return `${node.column.accept(this)} = ${node.value.accept(this)}`
  }
  visitBetweenPredicateExpression(node) {
    return `${node.expression.accept(this)}${
      node.not ? ' NOT' : ''
    } BETWEEN ${node.leftBetween.accept(this)} AND ${node.rightBetween.accept(
      this
    )}`
  }
  visitBinaryExpression(node) {
    return `${node.left.accept(
      this
    )} ${node.operator.toUpperCase()} ${node.right.accept(this)}`
  }
  visitBinaryUnionQueryExpression(node) {
    let sql
    if (node.left instanceof BinaryUnionQueryExpression) {
      sql = `${node.left.accept(this)} UNION${
        node.all ? ' ALL' : ''
      } (${node.right.accept(this)})`
    } else {
      sql = `(${node.left.accept(this)}) UNION${
        node.all ? ' ALL' : ''
      } (${node.right.accept(this)})`
    }
    sql += this.visitQueryExpression(node)
    return sql
  }

  visitBindingVariable(node) {
    var _a
    this._queryBuilder.addBinding(
      node.bindingExpression.accept(this),
      (_a = this.explicitBindingType) !== null && _a !== void 0
        ? _a
        : node.type === 'where' && this.inJoinExpression
        ? 'join'
        : node.type
    )

    return `?`
  }
  visitColumnReferenceExpression(node) {
    const columnName = resolveIdentifier(node.fieldAliasIdentificationVariable)
    if (columnName) {
      return `${node.expression.accept(
        this
      )} AS ${this._grammar.quoteColumnName(columnName)}`
    } else {
      return `${node.expression.accept(this)}`
    }
  }
  visitCommonValueExpression(node) {
    throw new Error('Method not implemented.')
  }
  visitComparisonExpression(node) {
    const left = node.left.accept(this)
    if (
      node.right instanceof BindingVariable &&
      node.right.bindingExpression instanceof RawExpression &&
      node.right.bindingExpression.value == null
    ) {
      if (node.operator === '=') {
        return `${left} is null`
      } else if (node.operator === '!=' || node.operator === '<>') {
        return `${left} is not null`
      }
    }
    return `${left} ${node.operator} ${node.right.accept(this)}`
  }

  visitConditionExpression(node) {
    return node.conditionTerms.map((it) => it.accept(this)).join(' AND ')
  }
  visitConditionTermExpression(node) {
    throw new Error('Method not implemented.')
  }
  visitExistsPredicateExpression(node) {
    return `${node.not ? 'NOT EXISTS' : 'EXISTS'} ${node.expression.accept(
      this
    )}`
  }
  visitFieldAsExpression(node) {
    throw new Error('Method not implemented.')
  }
  visitFromClause(node) {
    if (node.joins.length > 0) {
      const joins = node.joins.map((it) => it.accept(this))
      return `FROM ${node.from.accept(this)} ${joins.join(' ')}`
    } else {
      return `FROM ${node.from.accept(this)}`
    }
  }
  visitFromTable(node) {
    let rst

    rst = node.table.accept(this)

    if (node.indexBy) {
    }
    return `${rst}`
  }
  visitFunctionCallExpression(node) {
    let funcName = node.name.accept(this)
    funcName = this._grammar.compilePredicateFuncName(funcName)
    return `${funcName}(${node.parameters
      .map((it) => it.accept(this))
      .join(', ')})`
  }
  visitGroupByClause(node) {
    return `GROUP BY ${node.groups.map((it) => it.accept(this)).join(', ')}`
  }
  visitHavingClause(node) {
    return `HAVING ${node.expressions.map((it) => it.accept(this)).join(',')}`
  }
  visitIdentifier(node) {
    if (isString(node.name)) {
      return node.name
    }
    return resolveForwardRef(node.name)
  }

  visitIdentifyVariableDeclaration(node) {
    let rst = ''
    const visitedRangeVariableDeclaration =
      node.rangeVariableDeclaration.accept(this)
    rst += visitedRangeVariableDeclaration
    if (node.indexBy) {
    }
    return rst
  }
  visitInPredicateExpression(node) {
    if (node.subQuery) {
      return `${node.expression.accept(this)}${
        node.not ? ' NOT' : ''
      } IN ${node.subQuery.accept(this)}`
    }
    if (node.values.length === 0) {
      if (node.not) {
        return `1 = 1`
      } else {
        return `0 = 1`
      }
    }
    return `${node.expression.accept(this)}${
      node.not ? ' NOT' : ''
    } IN (${node.values.map((it) => it.accept(this)).join(', ')})`
  }
  visitInsertSpecification(node) {
    let sql = `INSERT ${node.insertOption.toUpperCase()} ${node.target.accept(
      this
    )}`
    sql += ` (${node.columns.map((it) => it.accept(this)).join(', ')})`
    sql += `${node.insertSource.accept(this)}`
    return sql
  }
  visitJoinClause(node) {
    throw new Error('not implement')
  }
  visitJoinExpression(node) {
    this.inJoinExpression = true

    let tableName
    if (node.name instanceof Identifier) {
      tableName = this._grammar.quoteTableName(node.name.accept(this))
    } else if (node.name instanceof JoinedTable) {
      tableName = `(${node.name.accept(this)})`
    } else {
      tableName = `${node.name.accept(this)}`
    }
    const sql = `${node.type.toUpperCase()} JOIN ${tableName}${
      node.on ? ` ON ${node.on.accept(this)}` : ''
    }`
    this.inJoinExpression = false
    return sql
  }
  visitJoinFragment(node) {
    return this._grammar.compileJoinFragment(node.joinQueryBuilder, this)
  }
  visitJoinOnExpression(node) {
    return `${node.columnExpression.accept(this)} ${
      node.operator
    } ${node.rightExpression.accept(this)}`
  }
  visitJoinedTable(node) {
    return `${node.from.accept(this)} ${node.joinExpressions
      .map((it) => it.accept(this))
      .join(' ')}`
  }
  visitJsonPathColumn(node) {
    return `json_extract(${node.columns.accept(this)}, ${node.jsonPaths.accept(
      this
    )})`
  }
  visitJsonPathExpression(node) {
    const pathLeg = node.pathLeg.accept(this)
    if (pathLeg === '->') {
      return `json_extract(${node.pathExpression.accept(
        this
      )}, "$.${node.jsonLiteral.accept(this)}")`
    } else if (pathLeg === '->>') {
      return `json_unquote(json_extract(${node.pathExpression.accept(
        this
      )}, "$.${node.jsonLiteral.accept(this)}"))`
    }
    throw new Error('unknown path leg')
  }
  visitLimitClause(node) {
    return `LIMIT ${node.value}`
  }
  visitNestedExpression(node) {
    let sql
    if (node.expression instanceof QueryBuilder) {
      sql = `(${this._grammar.compileSelect(node.expression)})`
      this._queryBuilder.addBinding(node.expression.getBindings(), node.type)
    } else if (node.expression instanceof RawExpression) {
      sql = `(${node.expression.accept(this)})`

      this._queryBuilder.addBinding(node.bindings, node.type)
    } else {
      sql = `(${node.expression})`

      this._queryBuilder.addBinding(node.bindings, node.type)
    }
    return sql
  }
  visitNestedPredicateExpression(node) {
    if (node.query instanceof QueryBuilder) {
      return this._grammar.compileNestedPredicate(node.query, this)
    } else {
      return `(${node.query})`
    }
  }
  visitNodePart(node) {
    return 'node part'
  }
  visitNullPredicateExpression(node) {
    if (node.expression.expression instanceof JsonPathExpression) {
      const sql = node.expression.accept(this)
      if (node.not) {
        return `(${sql} IS NOT NULL AND json_type(${sql}) != 'NULL')`
      } else {
        return `(${sql} IS NULL OR json_type(${sql}) = 'NULL')`
      }
    }
    return `${node.expression.accept(this)}${
      node.not ? ' IS NOT NULL' : ' IS NULL'
    }`
  }
  visitNumberLiteralExpression(node) {
    return `${node.value}`
  }
  visitOffsetClause(node) {
    return `OFFSET ${node.offset}`
  }
  visitOrderByClause(node) {
    return `ORDER BY ${node.elements
      .map((it) => it.accept(this))
      .filter((it) => !isBlank(it) && it.length > 0)
      .join(', ')}`
  }
  visitOrderByElement(node, ctx) {
    let rejectColumns = []
    if (ctx && ctx.rejectColumns) {
      rejectColumns = ctx.rejectColumns
    }
    const columnName = `${node.column.accept(this)}`
    if (rejectColumns.includes(columnName)) {
      return ''
    } else {
      const direction = `${node.direction.toUpperCase()}`
      return `${columnName} ${direction}`
    }
  }
  visitParenthesizedExpression(node) {
    return `(${node.expression.accept(this)})`
  }
  visitPathExpression(node) {
    let schemaName = node.schemaIdentifier
      ? `${node.schemaIdentifier.accept(this)}`
      : null
    let tableName = node.tableIdentifier
      ? `${node.tableIdentifier.accept(this)}`
      : null
    let columnName = node.columnIdentifier
      ? `${node.columnIdentifier.accept(this)}`
      : null
    if (node.schemaIdentifier instanceof Identifier) {
      schemaName = this._grammar.quoteSchemaName(schemaName)
    }
    if (node.tableIdentifier instanceof Identifier) {
      tableName = this._grammar.quoteTableName(tableName)
    }
    if (node.columnIdentifier instanceof Identifier) {
      columnName =
        columnName === '*' ? '*' : this._grammar.quoteColumnName(columnName)
    }
    let tableAlias
    if (tableName) {
      const withAlias = tableName.replace(/'"`/g, '').split(/\s+as\s+/i)
      if (withAlias.length > 1) {
        tableAlias = withAlias.pop()
        tableName = tableAlias
      }
    }

    if (this._isVisitUpdateSpecification && !this._queryBuilder._joins.length) {
      if (!tableAlias) {
        return columnName
      }
    }
    if (tableName) {
      return `${tableName}.${columnName}`
    }
    return columnName
  }
  visitQueryExpression(node) {
    let sql = ''
    if (node.orderByClause) {
      sql += ` ${node.orderByClause.accept(this)}`
    }
    if (node.limitClause) {
      sql += ` ${node.limitClause.accept(this)}`
    }
    if (node.offsetClause) {
      sql += ` ${node.offsetClause.accept(this)}`
    }
    return sql
  }
  visitQuerySpecification(node) {
    let sql = `${node.selectClause.accept(this)}`
    if (node.fromClause) {
      sql += ` ${node.fromClause.accept(this)}`
    }
    if (node.whereClause) {
      sql += ` ${node.whereClause.accept(this)}`
    }
    if (node.groupByClause) {
      sql += ` ${node.groupByClause.accept(this)}`
    }
    if (node.havingClause) {
      sql += ` ${node.havingClause.accept(this)}`
    }
    if (node.lockClause) {
      sql += ` ${node.lockClause.accept(this)}`
    }
    sql += this.visitQueryExpression(node)
    return sql
  }
  visitRangeVariableDeclaration(node) {
    const quoteTableName = this._grammar.quoteTableName(node.abstractSchemaName)
    if (node.aliasIdentificationVariable) {
      return `${quoteTableName} AS ${this._grammar.quoteTableName(
        node.aliasIdentificationVariable
      )}`
    } else {
      return `${quoteTableName}`
    }
  }
  visitRawBindingExpression(node) {
    node.bindings.forEach((it) => {
      it.accept(this)
    })
    return `${node.raw.accept(this)}`
  }
  visitRawExpression(node) {
    if (isBoolean(node.value)) {
      return node.value
    } else if (isNumber(node.value)) {
      return +node.value
    } else if (isArray(node.value)) {
      return node.value
    } else if (isBlank(node.value)) {
      return null
    } else {
      return `${node.value}`
    }
  }
  visitSelectClause(node) {
    if (node.selectExpressions.length > 0) {
      const selectExpressions = node.selectExpressions.map((expression) => {
        return expression.accept(this)
      })
      return `SELECT${
        node.distinct ? ` ${this._grammar.distinct(node.distinct)} ` : ' '
      }${selectExpressions.join(', ')}`
    } else {
      return `SELECT${
        node.distinct ? ` ${this._grammar.distinct(node.distinct)} ` : ' '
      }*`
    }
  }
  visitSelectInsertSource(node) {
    throw new Error('Method not implemented.')
  }
  visitSelectScalarExpression(node) {
    return `${node.expression.accept(this)} AS ${node.columnName.accept(this)}`
  }
  visitSetClause(node) {
    throw new Error('Method not implemented.')
  }
  visitStringLiteralExpression(node) {
    if (isString(node.value)) {
      return `"${node.value.replace(/"'`/g, '')}"`
    }
    return `"${resolveForwardRef(node.value).replace(/"'`/g, '')}"`
  }
  visitTableName(node) {
    const tableName = []
    if (node.serverIdentifier) {
      tableName.push(node.serverIdentifier.accept(this))
    }
    if (node.databaseIdentifier) {
      tableName.push(node.databaseIdentifier.accept(this))
    }
    if (node.schemaIdentifier) {
      tableName.push(
        this._grammar.quoteSchemaName(node.schemaIdentifier.accept(this))
      )
    }
    if (node.baseIdentifier) {
      tableName.push(
        this._grammar.quoteTableName(node.baseIdentifier.accept(this))
      )
    } else {
      throw new Error('invalid table name')
    }
    return tableName.join('.')
  }
  visitTableReferenceExpression(node) {
    let name
    if (node.expression instanceof Identifier) {
      name = this._grammar.quoteTableName(node.expression.accept(this))
    } else if (node.expression instanceof PathExpression) {
      name = node.expression.accept(this)
    } else if (node.expression instanceof TableName) {
      name = node.expression.accept(this)
    } else {
      name = node.expression.accept(this)
    }
    if (node.alias) {
      const as = this._grammar.quoteTableName(node.alias.accept(this))
      return `${name} AS ${as}`
    } else {
      return name
    }
  }
  visitUnionFragment(node) {
    throw new Error('should not run')
  }
  visitUpdateSpecification(node) {
    let sql = `UPDATE ${node.target.accept(this)}`
    sql += ` SET ${node.setClauses.map((it) => it.accept(this)).join(', ')}`
    if (node.fromClause) {
      sql += ` ${node.fromClause.accept(this)}`
    }
    if (node.whereClause) {
      sql += ` ${node.whereClause.accept(this)}`
    }
    if (node.orderByClause) {
      sql += ` ${node.orderByClause.accept(this)}`
    }
    if (node.offsetClause) {
      sql += ` ${node.offsetClause.accept(this)}`
    }
    if (node.limitClause) {
      sql += ` ${node.limitClause.accept(this)}`
    }
    return sql
  }
  visitValuesInsertSource(node) {
    if (node.isDefault) {
      return ' DEFAULT VALUES'
    } else if (node.select) {
      return ` ${node.select.accept(this)}`
    } else {
      return ` VALUES ${node.valuesList
        .map((values) => `(${values.map((it) => it.accept(this)).join(', ')})`)
        .join(', ')}`
    }
  }
  visitWhereClause(node) {
    return `WHERE ${node.conditionExpression.accept(this)}`
  }
  visitLockClause(node) {
    if (node.value === true) {
      return `for update`
    } else if (node.value === false) {
      return 'lock in share mode'
    } else if (isString(node.value)) {
      return node.value
    }
    throw new Error('unexpected lock clause')
  }
  visitRejectOrderElementExpression(node, ctx) {
    const parentRejectColumns =
      ctx && ctx.rejectColumns ? ctx.rejectColumns : []
    const rejectColumns = node.columns.map((it) => it.accept(this))
    return `${node.orderByElements
      .map((it) =>
        it.accept(this, {
          rejectColumns: uniq([...rejectColumns, ...parentRejectColumns]),
        })
      )
      .filter((it) => !isBlank(it) && it.length > 0)
      .join(', ')}`
  }
  visitNotExpression(node) {
    return `not ${node.expression.accept(this)}`
  }
  visitIndexBy(node) {
    throw new Error('not implement')
  }
}
