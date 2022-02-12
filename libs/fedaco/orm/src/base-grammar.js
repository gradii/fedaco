/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { isArray } from '@gradii/check-type'
import { RawExpression } from './query/ast/expression/raw-expression'

export class BaseGrammar {
  constructor() {
    this.tablePrefix = ''
  }

  wrapArray(values) {
    return values.map((it) => this.wrap(it))
  }

  wrapTable(table) {
    if (!this.isExpression(table)) {
      return this.wrap(this.tablePrefix + table, true)
    }
    return this.getValue(table)
  }

  wrap(value, prefixAlias = false) {
    if (this.isExpression(value)) {
      return this.getValue(value)
    }
    if (value.includes(' as ')) {
      return this.wrapAliasedValue(value, prefixAlias)
    }
    if (this.isJsonSelector(value)) {
      return this.wrapJsonSelector(value)
    }
    return this.wrapSegments(value.split('.'))
  }

  wrapAliasedValue(value, prefixAlias = false) {
    const segments = value.split(/\s+as\s+/i)
    if (prefixAlias) {
      segments[1] = this.tablePrefix + segments[1]
    }
    return this.wrap(segments[0]) + ' as ' + this.wrapValue(segments[1])
  }

  wrapSegments(segments) {
    return segments
      .map((segment, key) => {
        return key == 0 && segments.length > 1
          ? this.wrapTable(segment)
          : this.wrapValue(segment)
      })
      .join('.')
  }

  wrapValue(value) {
    if (value !== '*') {
      return '"' + value.replace('"', '""') + '"'
    }
    return value
  }

  wrapJsonSelector(value) {
    throw new Error(
      'RuntimeException This database engine does not support JSON operations.'
    )
  }

  isJsonSelector(value) {
    return value.includes('->')
  }

  columnize(columns) {
    return columns.map((it) => this.wrap(it)).join(', ')
  }

  parameterize(values) {
    return values.map((it) => this.parameter(it)).join(', ')
  }

  parameter(value) {
    return this.isExpression(value) ? this.getValue(value) : '?'
  }

  quoteString(value) {
    if (isArray(value)) {
      return value.map((it) => this.quoteString(it)).join(', ')
    }
    return `'${value}'`
  }

  isExpression(value) {
    return value instanceof RawExpression
  }

  getValue(expression) {
    return expression.value
  }

  getDateFormat() {
    return 'yyyy-MM-dd HH:mm:ss'
  }

  getTablePrefix() {
    return this.tablePrefix
  }

  setTablePrefix(prefix) {
    this.tablePrefix = prefix
    return this
  }
}
