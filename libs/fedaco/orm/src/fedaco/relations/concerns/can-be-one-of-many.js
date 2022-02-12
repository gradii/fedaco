/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { isBlank, isFunction, isString } from '@gradii/check-type'
import { last } from 'ramda'
import { wrap } from '../../../helper/arr'
export function mixinCanBeOneOfMany(base) {
  return class _Self extends base {
    constructor() {
      super(...arguments)

      this._isOneOfMany = false
    }

    addOneOfManySubQueryConstraints(query, column = null, aggregate = null) {
      throw new Error('not implement')
    }

    getOneOfManySubQuerySelectColumns() {
      throw new Error('not implement')
    }

    addOneOfManyJoinSubQueryConstraints(join) {
      throw new Error('not implement')
    }

    ofMany(column = 'id', aggregate = 'MAX', relation) {
      this._isOneOfMany = true
      this._relationName = relation
      const keyName = this._query.getModel().getKeyName()
      const columns = isString(column)
        ? {
            [column]: aggregate,
            [keyName]: aggregate,
          }
        : column
      if (!(keyName in columns)) {
        columns[keyName] = 'MAX'
      }
      let closure
      if (isFunction(aggregate)) {
        closure = aggregate
      }
      let previous
      const columnsEntries = Object.entries(columns)
      const lastColumn = columnsEntries[columnsEntries.length - 1][0]
      for (const [_column, _aggregate] of columnsEntries) {
        if (!['min', 'max'].includes(_aggregate.toLowerCase())) {
          throw new Error(
            `InvalidArgumentException Invalid aggregate [${_aggregate}] used within ofMany relation. ` +
              `Available aggregates: MIN, MAX`
          )
        }

        const subQuery = this._newOneOfManySubQuery(
          this.getOneOfManySubQuerySelectColumns(),
          _column,
          _aggregate
        )
        if (previous !== undefined) {
          this._addOneOfManyJoinSubQuery(
            subQuery,
            previous['subQuery'],
            previous['column']
          )
        } else if (closure !== undefined) {
          closure(subQuery)
        }
        if (!(previous !== undefined)) {
          this._oneOfManySubQuery = subQuery
        }
        if (lastColumn == _column) {
          this._addOneOfManyJoinSubQuery(this._query, subQuery, _column)
        }
        previous = {
          subQuery: subQuery,
          column: _column,
        }
      }
      this.addConstraints()
      return this
    }

    latestOfMany(column = 'id', relation = '_latestOfMany') {
      return this.ofMany(
        wrap(column).reduce((prev, col) => {
          prev[col] = 'MAX'
          return prev
        }, {}),
        'MAX',
        relation
      )
    }

    oldestOfMany(column = 'id', relation = '_oldestOfMany') {
      return this.ofMany(
        wrap(column).reduce((prev, col) => {
          prev[col] = 'MIN'
          return prev
        }, {}),
        'MIN',
        relation
      )
    }

    _newOneOfManySubQuery(groupBy, column, aggregate) {
      const subQuery = this._query.getModel().newQuery()
      for (const group of wrap(groupBy)) {
        subQuery.groupBy(this._qualifyRelatedColumn(group))
      }
      if (!isBlank(column)) {
        subQuery.selectRaw(
          `${aggregate}(${subQuery
            .getQuery()
            ._grammar.wrap(column)}) AS ${subQuery
            .getQuery()
            ._grammar.wrap(column)}`
        )
      }

      this.addOneOfManySubQueryConstraints(subQuery, groupBy, column, aggregate)
      return subQuery
    }

    _addOneOfManyJoinSubQuery(parent, subQuery, on) {
      parent.beforeQuery((parent) => {
        subQuery.applyBeforeQueryCallbacks()
        parent.joinSub(subQuery, this._relationName, (join) => {
          join.on(
            this._qualifySubSelectColumn(on),
            '=',
            this._qualifyRelatedColumn(on)
          )
          this.addOneOfManyJoinSubQueryConstraints(join)
        })
      })
    }

    _mergeOneOfManyJoinsTo(query) {
      query.getQuery()._beforeQueryCallbacks =
        this._query.getQuery()._beforeQueryCallbacks
      query.applyBeforeQueryCallbacks()
    }

    _getRelationQuery() {
      return this.isOneOfMany() ? this._oneOfManySubQuery : this._query
    }

    getOneOfManySubQuery() {
      return this._oneOfManySubQuery
    }

    _qualifySubSelectColumn(column) {
      return `${this.getRelationName()}.${last(column.split('.'))}`
    }

    _qualifyRelatedColumn(column) {
      return column.includes('.')
        ? column
        : this._query.getModel().getTable() + '.' + column
    }

    isOneOfMany() {
      return this._isOneOfMany
    }

    getRelationName() {
      return this._relationName
    }
  }
}
