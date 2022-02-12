import { RejectOrderElementExpression } from '../../query/ast/fragment/order/reject-order-element-expression'
import { Identifier } from '../../query/ast/identifier'
export function mixinLimitOffset(base) {
  return class _Self extends base {
    limit(value) {
      if (value >= 0) {
        if (this._unions.length > 0) {
          this._unionLimit = value
        } else {
          this._limit = value
        }
      }
      return this
    }

    skip(value) {
      return this.offset(value)
    }

    offset(value) {
      value = Math.max(0, value)
      if (this._unions.length > 0) {
        this._unionOffset = value
      } else {
        this._offset = value
      }
      return this
    }

    take(value) {
      return this.limit(value)
    }
    forPage(pageNo, pageSize) {
      return this.offset((pageNo - 1) * pageSize).limit(pageSize)
    }
    forPageBeforeId(perPage = 15, lastId = 0, column = 'id') {
      this._orders = this._removeExistingOrdersFor(column)
      if (lastId !== null) {
        this.where(column, '<', lastId)
      }
      return this.orderBy(column, 'desc').limit(perPage)
    }
    forPageAfterId(perPage = 15, lastId = 0, column = 'id') {
      this._orders = this._removeExistingOrdersFor(column)
      if (lastId !== null) {
        this.where(column, '>', lastId)
      }
      return this.orderBy(column, 'asc').limit(perPage)
    }

    _removeExistingOrdersFor(column) {
      return [
        new RejectOrderElementExpression(
          [new Identifier(column)],
          this._orders
        ),
      ]
    }
  }
}
