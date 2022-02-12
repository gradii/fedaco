/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { __awaiter } from 'tslib'
import { isBlank, isNumber } from '@gradii/check-type'
export function mixinComparesRelatedModels(base) {
  return class _Self extends base {
    is(model) {
      return __awaiter(this, void 0, void 0, function* () {
        const match =
          !isBlank(model) &&
          this._compareKeys(
            this.getParentKey(),
            this._getRelatedKeyFrom(model)
          ) &&
          this._related.getTable() === model.getTable() &&
          this._related.getConnectionName() === model.getConnectionName()

        if (match && this.supportsPartialRelations && this.isOneOfMany()) {
          return this._query.whereKey(model.getKey()).exists()
        }
        return match
      })
    }

    isNot(model) {
      return __awaiter(this, void 0, void 0, function* () {
        return !(yield this.is(model))
      })
    }

    _compareKeys(parentKey, relatedKey) {
      if (isBlank(parentKey) || isBlank(relatedKey)) {
        return false
      }
      if (isNumber(parentKey) || isNumber(relatedKey)) {
        return parentKey === relatedKey
      }
      return parentKey === relatedKey
    }
  }
}
