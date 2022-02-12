import { isString } from '@gradii/check-type'
import { RawExpression } from '../../query/ast/expression/raw-expression'
import { OrderByElement } from '../../query/ast/order-by-element'
import { SqlParser } from '../../query/parser/sql-parser'
import { rawSqlBindings } from '../ast-factory'
import { wrapToArray } from '../ast-helper'
export function mixinOrderBy(base) {
  return class _Self extends base {
    latest(column = 'created_at') {
      return this.orderBy(column, 'desc')
    }

    oldest(column = 'created_at') {
      return this.orderBy(column, 'asc')
    }

    orderBy(column, direction = 'asc') {
      let columnNode
      if (this.isQueryable(column)) {
        columnNode = this._createSubQuery(
          this._unions.length > 0 ? 'unionOrder' : 'order',
          column
        )
      } else if (column instanceof RawExpression) {
        columnNode = column
      } else if (isString(column)) {
        columnNode = SqlParser.createSqlParser(column).parseUnaryTableColumn()
      } else {
        throw new Error('invalid column type')
      }
      direction = direction.toLowerCase()
      if (!['asc', 'desc'].includes(direction)) {
        throw new Error(
          'InvalidArgumentException Order direction must be "asc" or "desc".'
        )
      }
      this._addOrder(new OrderByElement(columnNode, direction))
      return this
    }

    orderByDesc(column) {
      return this.orderBy(column, 'desc')
    }

    orderByRaw(sql, bindings = []) {
      bindings = wrapToArray(bindings)
      if (this._unions.length > 0) {
        this._unionOrders.push(rawSqlBindings(sql, bindings, 'unionOrder'))
      } else {
        this._orders.push(rawSqlBindings(sql, bindings, 'order'))
      }
      return this
    }

    reorder(column, direction = 'asc') {
      this._orders = []
      this._unionOrders = []
      this._bindings['order'] = []
      this._bindings['unionOrder'] = []
      if (column) {
        return this.orderBy(column, direction)
      }
      return this
    }
    _addOrder(ast) {
      if (this._unions.length > 0) {
        this._unionOrders.push(ast)
      } else {
        this._orders.push(ast)
      }
      return this
    }
  }
}
