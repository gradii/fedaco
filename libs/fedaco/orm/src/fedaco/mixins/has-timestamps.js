import { __awaiter } from 'tslib'
import { isBlank } from '@gradii/check-type'
import { getUnixTime } from 'date-fns'

export function mixinHasTimestamps(base) {
  return class _Self extends base {
    constructor() {
      super(...arguments)

      this._timestamps = true
    }

    touch(attribute = null) {
      return __awaiter(this, void 0, void 0, function* () {
        if (attribute) {
          this[attribute] = this.freshTimestamp()
          return this.save()
        }
        if (!this.usesTimestamps()) {
          return false
        }
        this.updateTimestamps()
        return this.save()
      })
    }

    updateTimestamps() {
      const time = this.freshTimestamp()
      const createdAtColumn = this.getCreatedAtColumn()
      if (
        !this._exists &&
        !isBlank(createdAtColumn) &&
        !this.isDirty(createdAtColumn)
      ) {
        this.setCreatedAt(time)
      }
      const updatedAtColumn = this.getUpdatedAtColumn()
      if (!isBlank(updatedAtColumn) && !this.isDirty(updatedAtColumn)) {
        this.setUpdatedAt(time)
      }
    }

    setCreatedAt(value) {
      this[this.getCreatedAtColumn()] = value
      return this
    }

    setUpdatedAt(value) {
      this[this.getUpdatedAtColumn()] = value
      return this
    }

    freshTimestamp() {
      return getUnixTime(new Date())
    }

    freshTimestampString() {
      return this.fromDateTime(this.freshTimestamp())
    }

    usesTimestamps() {
      return this._timestamps
    }

    getCreatedAtColumn() {
      return 'CREATED_AT' in this.constructor
        ? this.constructor.CREATED_AT
        : 'created_at'
    }

    getUpdatedAtColumn() {
      return 'UPDATED_AT' in this.constructor
        ? this.constructor.UPDATED_AT
        : 'updated_at'
    }

    getQualifiedCreatedAtColumn() {
      return this.qualifyColumn(this.getCreatedAtColumn())
    }

    getQualifiedUpdatedAtColumn() {
      return this.qualifyColumn(this.getUpdatedAtColumn())
    }
  }
}
