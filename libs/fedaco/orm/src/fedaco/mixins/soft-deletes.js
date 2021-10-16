import { __awaiter } from 'tslib'
import { isBlank } from '@gradii/check-type'
import { tap } from 'ramda'
import { SoftDeletingScope } from '../scopes/soft-deleting-scope'
export function mixinSoftDeletes(base) {
  return class _Self extends base {
    constructor() {
      super(...arguments)
      this.isTypeofSoftDeletes = true

      this._forceDeleting = false
    }

    boot() {
      this.constructor.addGlobalScope('softDeleting', new SoftDeletingScope())
    }

    initializeSoftDeletes() {
      if (!(this._casts[this.getDeletedAtColumn()] !== undefined)) {
        this._casts[this.getDeletedAtColumn()] = 'datetime'
      }
    }

    forceDelete() {
      return __awaiter(this, void 0, void 0, function* () {
        this._forceDeleting = true
        return tap((deleted) => {
          this._forceDeleting = false
          if (deleted) {
            this._fireModelEvent('forceDeleted', false)
          }
        }, yield this.delete())
      })
    }

    _performDeleteOnModel() {
      return __awaiter(this, void 0, void 0, function* () {
        if (this._forceDeleting) {
          this._exists = false
          return this._setKeysForSaveQuery(this.newModelQuery()).delete()
        }
        return this._runSoftDelete()
      })
    }

    _runSoftDelete() {
      const query = this._setKeysForSaveQuery(this.newModelQuery())
      const time = this.freshTimestamp()
      const columns = {
        [this.getDeletedAtColumn()]: this.fromDateTime(time),
      }

      this[this.getDeletedAtColumn()] = time
      if (this._timestamps && !isBlank(this.getUpdatedAtColumn())) {
        this[this.getUpdatedAtColumn()] = time

        columns[this.getUpdatedAtColumn()] = this.fromDateTime(time)
      }
      query.update(columns)
      this.syncOriginalAttributes(Object.keys(columns))
      this.fireModelEvent('trashed', false)
    }

    restore() {
      return __awaiter(this, void 0, void 0, function* () {
        if (this._fireModelEvent('restoring') === false) {
          return false
        }

        this[this.getDeletedAtColumn()] = null
        this._exists = true
        const result = yield this.save()
        this._fireModelEvent('restored', false)
        return result
      })
    }

    trashed() {
      return !isBlank(this[this.getDeletedAtColumn()])
    }

    isForceDeleting() {
      return this._forceDeleting
    }

    getDeletedAtColumn() {
      return this.constructor.DELETED_AT || 'deleted_at'
    }

    getQualifiedDeletedAtColumn() {
      return this.qualifyColumn(this.getDeletedAtColumn())
    }
  }
}
