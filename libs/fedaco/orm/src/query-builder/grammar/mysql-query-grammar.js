/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { isAnyEmpty, isArray, isObject } from '@gradii/check-type'
import { wrap } from '../../helper/arr'
import { MysqlQueryBuilderVisitor } from '../visitor/mysql-query-builder-visitor'
import { QueryBuilderVisitor } from '../visitor/query-builder-visitor'
import { QueryGrammar } from './query-grammar'
export class MysqlQueryGrammar extends QueryGrammar {
  constructor() {
    super(...arguments)
    this._tablePrefix = ''
  }
  compileJoins() {}
  _createVisitor(queryBuilder) {
    return new MysqlQueryBuilderVisitor(queryBuilder._grammar, queryBuilder)
  }
  compileSelect(builder) {
    const ast = this._prepareSelectAst(builder)
    const visitor = new MysqlQueryBuilderVisitor(builder._grammar, builder)
    return ast.accept(visitor)
  }
  compileUpdate(builder, values) {
    const ast = this._prepareUpdateAst(builder, values)
    const visitor = new MysqlQueryBuilderVisitor(builder._grammar, builder)
    return ast.accept(visitor)
  }
  compileUpsert(builder, values, uniqueBy, update) {
    const sql =
      this.compileInsert(builder, values) + ' on duplicate key update '
    const columns = []
    if (isObject(update)) {
      for (const [key, val] of Object.entries(update)) {
        columns.push(wrap(key) + ' = ' + this.parameter(val))
      }
    } else if (isArray(update)) {
      update.forEach((val) => {
        columns.push(`${wrap(val)} = values(${wrap(val)})`)
      })
    }
    return sql + columns.join(', ')
  }
  compilePredicateFuncName(funcName) {
    if (funcName === 'JsonLength') {
      return 'json_length'
    }
    return super.compilePredicateFuncName(funcName)
  }
  distinct(distinct) {
    if (distinct !== false) {
      return 'DISTINCT'
    } else {
      return ''
    }
  }
  quoteColumnName(columnName) {
    if (columnName === '*') {
      return columnName
    }
    return `\`${columnName.replace(/`/g, '')}\``
  }
  quoteTableName(tableName) {
    return `\`${this._tablePrefix}${tableName.replace(/`/g, '')}\``
  }
  quoteSchemaName(quoteSchemaName) {
    return `\`${quoteSchemaName.replace(/`/g, '')}\``
  }
  setTablePrefix(prefix) {
    this._tablePrefix = prefix
    return this
  }
  compileInsert(builder, values, insertOption = 'into') {
    if (isAnyEmpty(values)) {
      const visitor = new QueryBuilderVisitor(builder._grammar, builder)
      return 'INSERT INTO ' + `${builder._from.accept(visitor)} () VALUES ()`
    }
    return super.compileInsert(builder, values, insertOption)
  }
  compileInsertGetId(builder, values, sequence) {
    return `${this.compileInsert(
      builder,
      values,
      'into'
    )} returning ${this.wrap(sequence)}`
  }
}
