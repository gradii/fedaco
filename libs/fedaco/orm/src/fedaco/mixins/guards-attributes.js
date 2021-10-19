import { __awaiter } from 'tslib'
import { reflector } from '@gradii/annotation'
import { isArray, isPromise } from '@gradii/check-type'
import { findLast } from 'ramda'
import { FedacoColumn } from '../../annotation/column'
function isAnyGuarded(guarded) {
  return guarded.length === 1 && guarded[0] === '*'
}
export function mixinGuardsAttributes(base) {
  var _a
  return (
    (_a = class _Self extends base {
      constructor() {
        super(...arguments)

        this._fillable = []

        this._guarded = ['*']
      }

      getFillable() {
        return this._fillable
      }

      fillable(fillable) {
        this._fillable = fillable
        return this
      }

      mergeFillable(fillable) {
        this._fillable = [...this._fillable, ...fillable]
        return this
      }

      getGuarded() {
        return this._guarded
      }

      guard(guarded) {
        this._guarded = guarded
        return this
      }

      mergeGuarded(guarded) {
        this._guarded = [...this._guarded, ...guarded]
        return this
      }

      static unguard(state = true) {
        this._unguarded = state
      }

      static reguard() {
        this._unguarded = false
      }

      static isUnguarded() {
        return this._unguarded
      }

      static unguarded(callback) {
        return __awaiter(this, void 0, void 0, function* () {
          if (this._unguarded) {
            return callback()
          }
          this.unguard()
          try {
            const rst = callback()
            if (isPromise(rst)) {
              return rst.finally(() => {
                this.reguard()
              })
            } else {
              return rst
            }
          } finally {
            this.reguard()
          }
        })
      }

      isFillable(key) {
        if (this.constructor._unguarded) {
          return true
        }
        if (this.getFillable().includes(key)) {
          return true
        }
        if (this.isGuarded(key)) {
          return false
        }
        return (
          !this.getFillable().length &&
          !key.includes('.') &&
          !key.startsWith('_')
        )
      }

      isGuarded(key) {
        if (!this.getGuarded().length) {
          return false
        }
        return (
          isAnyGuarded(this.getGuarded()) ||
          this.getGuarded().includes(key) ||
          !this._isGuardableColumn(key)
        )
      }

      _isGuardableColumn(key) {
        if (this._guardableColumns == undefined) {
          this._guardableColumns = []
          const meta = reflector.propMetadata(this.constructor)
          for (const x of Object.keys(meta)) {
            if (meta[x] && isArray(meta[x])) {
              const currentMeta = findLast((it) => {
                return FedacoColumn.isTypeOf(it)
              }, meta[x])
              if (currentMeta) {
                this._guardableColumns.push(x)
              }
            }
          }
        }
        return this._guardableColumns.includes(key)
      }

      totallyGuarded() {
        return (
          this.getFillable().length === 0 && isAnyGuarded(this.getGuarded())
        )
      }

      _fillableFromArray(attributes) {
        if (this.getFillable().length > 0 && !this.constructor._unguarded) {
          const rst = {},
            fillable = this.getFillable()
          for (const key of Object.keys(attributes)) {
            if (fillable.includes(key)) {
              rst[key] = attributes[key]
            }
          }
          return rst
        }
        return attributes
      }
    }),
    (_a._unguarded = false),
    _a
  )
}
