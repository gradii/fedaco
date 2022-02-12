/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { reflector } from '@gradii/annotation'
import { isArray, isBlank } from '@gradii/check-type'
import { difference, findLast } from 'ramda'
import { Table } from '../../annotation/table/table'
import { value } from '../../helper/fn'
export function mixinHidesAttributes(base) {
  return class _Self extends base {
    getHidden() {
      if (isBlank(this._hidden)) {
        const metas = reflector.annotations(this.constructor)
        const meta = findLast((it) => {
          return Table.isTypeOf(it)
        }, metas)
        if (meta && isArray(meta.hidden)) {
          this._hidden = meta.hidden
        } else {
          this._hidden = []
        }
      }
      return this._hidden
    }

    setHidden(hidden) {
      this._hidden = hidden
      return this
    }

    getVisible() {
      if (isBlank(this._visible)) {
        const metas = reflector.annotations(this.constructor)
        const meta = findLast((it) => {
          return Table.isTypeOf(it)
        }, metas)
        if (meta && isArray(meta.visible)) {
          this._visible = meta.visible
        } else {
          this._visible = []
        }
      }
      return this._visible
    }

    setVisible(visible) {
      this._visible = visible
      return this
    }

    makeVisible(attributes) {
      attributes = isArray(attributes) ? attributes : [...arguments]
      this._hidden = difference(this._hidden, attributes)
      if (this.getVisible().length) {
        this._visible = [...this._visible, ...attributes]
      }
      return this
    }

    makeVisibleIf(condition, attributes) {
      return value(condition, this) ? this.makeVisible(attributes) : this
    }

    makeHidden(attributes) {
      this._hidden = [
        ...this._hidden,
        ...(isArray(attributes) ? attributes : arguments),
      ]
      return this
    }

    makeHiddenIf(condition, attributes) {
      return value(condition, this) ? this.makeHidden(attributes) : this
    }
  }
}
