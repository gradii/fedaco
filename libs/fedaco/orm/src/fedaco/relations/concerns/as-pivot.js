import { __awaiter } from 'tslib'
import { reflector } from '@gradii/annotation'
import { isArray, isBlank } from '@gradii/check-type'
import { findLast, tap } from 'ramda'
import { Table } from '../../../annotation/table/table'
import { singular } from '../../../helper/pluralize'
import { Pivot } from '../pivot'
export function mixinAsPivot(base) {
  return class _Self extends base {
    static fromAttributes(parent, attributes, table, exists = false) {
      const instance = new this()
      instance._timestamps = instance.hasTimestampAttributes(attributes)
      instance
        .setConnection(parent.getConnectionName())
        .setTable(table)
        .forceFill(attributes)
        .syncOriginal()
      instance.pivotParent = parent
      instance._exists = exists
      return instance
    }

    static fromRawAttributes(parent, attributes, table, exists = false) {
      const instance = this.fromAttributes(parent, [], table, exists)
      instance._timestamps = instance.hasTimestampAttributes(attributes)
      instance.setRawAttributes(attributes, exists)
      return instance
    }

    _setKeysForSelectQuery(query) {
      if (this._attributes[this.getKeyName()] !== undefined) {
        return super._setKeysForSelectQuery(query)
      }
      query.where(
        this._foreignKey,
        this.getOriginal(this._foreignKey, this.getAttribute(this._foreignKey))
      )
      return query.where(
        this._relatedKey,
        this.getOriginal(this._relatedKey, this.getAttribute(this._relatedKey))
      )
    }

    _setKeysForSaveQuery(query) {
      return this._setKeysForSelectQuery(query)
    }

    delete() {
      const _super = Object.create(null, {
        delete: { get: () => super.delete },
      })
      return __awaiter(this, void 0, void 0, function* () {
        if (this._attributes[this.getKeyName()] !== undefined) {
          return _super.delete.call(this)
        }
        if (this._fireModelEvent('deleting') === false) {
          return 0
        }
        yield this.touchOwners()
        return tap(() => {
          this._exists = false
          this._fireModelEvent('deleted', false)
        }, yield this._getDeleteQuery().delete())
      })
    }

    _getDeleteQuery() {
      return this.newQueryWithoutRelationships().where({
        [this._foreignKey]: this.getOriginal(
          this._foreignKey,
          this.getAttribute(this._foreignKey)
        ),
        [this._relatedKey]: this.getOriginal(
          this._relatedKey,
          this.getAttribute(this._relatedKey)
        ),
      })
    }

    getTable() {
      if (isBlank(this._table)) {
        const metas = reflector.annotations(this.constructor)
        const meta = findLast((it) => {
          return Table.isTypeOf(it)
        }, metas)
        if (meta) {
          return singular(meta.tableName)
        } else if (this.constructor === Pivot) {
          return 'pivot'
        } else {
          throw new Error(
            'must define table in annotation or `_table` property'
          )
        }
      }
      return this._table
    }

    getForeignKey() {
      return this._foreignKey
    }

    getRelatedKey() {
      return this._relatedKey
    }

    getOtherKey() {
      return this.getRelatedKey()
    }

    setPivotKeys(foreignKey, relatedKey) {
      this._foreignKey = foreignKey
      this._relatedKey = relatedKey
      return this
    }

    hasTimestampAttributes(attributes = null) {
      return (
        this.getCreatedAtColumn() in
        (attributes !== null && attributes !== void 0
          ? attributes
          : this.attributes)
      )
    }

    getCreatedAtColumn() {
      return this.pivotParent
        ? this.pivotParent.getCreatedAtColumn()
        : super.getCreatedAtColumn()
    }

    getUpdatedAtColumn() {
      return this.pivotParent
        ? this.pivotParent.getUpdatedAtColumn()
        : super.getUpdatedAtColumn()
    }

    getQueueableId() {
      if (this._attributes[this.getKeyName()] !== undefined) {
        return this.getKey()
      }
      return `${this._foreignKey}:${this.getAttribute(this._foreignKey)}:${
        this._relatedKey
      }:${this.getAttribute(this._relatedKey)}`
    }

    newQueryForRestoration(ids) {
      if (isArray(ids)) {
        return this._newQueryForCollectionRestoration(ids)
      }
      if (!ids.includes(':')) {
        return super.newQueryForRestoration(ids)
      }
      const segments = ids.split(':')
      return this.newQueryWithoutScopes()
        .where(segments[0], segments[1])
        .where(segments[2], segments[3])
    }

    _newQueryForCollectionRestoration(ids) {
      if (!`${ids[0]}`.includes(':')) {
        return super.newQueryForRestoration(ids)
      }
      const query = this.newQueryWithoutScopes()
      for (const id of ids) {
        const segments = id.split(':')
        query.orWhere((q) => {
          return q
            .where(segments[0], segments[1])
            .where(segments[2], segments[3])
        })
      }
      return query
    }

    unsetRelations() {
      this.pivotParent = null
      this._relations = []

      return this
    }
  }
}
