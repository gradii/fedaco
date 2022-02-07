import { __awaiter } from 'tslib'
import { isArray, isBlank, isString } from '@gradii/check-type'
import { difference, intersection, pluck } from 'ramda'
import { mapWithKeys, wrap } from '../../../helper/arr'
import { BaseModel } from '../../base-model'
import { newPivot } from '../../model-helper-global'
export function mixinInteractsWithPivotTable(base) {
  return class _Self extends base {
    toggle(ids, touch = true) {
      return __awaiter(this, void 0, void 0, function* () {
        const changes = {
          attached: [],
          detached: [],
        }
        const records = this._formatRecordsList(this._parseIds(ids))
        const detach = Object.values(
          intersection(
            yield this.newPivotQuery().pluck(this.relatedPivotKey),
            Object.keys(records)
          )
        )
        if (detach.length > 0) {
          this.detach(detach, false)
          changes['detached'] = this.castKeys(detach)
        }
        const attach = difference(Object.keys(records), detach)
        if (attach.length > 0) {
          this.attach(attach, [], false)
          changes['attached'] = Object.keys(attach)
        }
        if (
          touch &&
          (changes['attached'].length || changes['detached'].length)
        ) {
          yield this.touchIfTouching()
        }
        return changes
      })
    }

    syncWithoutDetaching(ids) {
      return this.sync(ids, false)
    }

    sync(ids, detaching = true) {
      return __awaiter(this, void 0, void 0, function* () {
        let changes = {
          attached: [],
          detached: [],
          updated: [],
        }
        const current = pluck(
          this.relatedPivotKey,
          yield this._getCurrentlyAttachedPivots()
        )
        const records = this._formatRecordsList(this._parseIds(ids))
        const detach = difference(current, Object.keys(records))
        if (detaching && detach.length > 0) {
          this.detach(detach)
          changes['detached'] = this._castKeys(detach)
        }
        changes = Object.assign(
          Object.assign({}, changes),
          this._attachNew(records, current, false)
        )
        if (
          changes['attached'].length ||
          changes['updated'].length ||
          changes['detached'].length
        ) {
          yield this.touchIfTouching()
        }
        return changes
      })
    }

    syncWithPivotValues(ids, values, detaching = true) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.sync(
          mapWithKeys(this._parseIds(ids), (id) => {
            return { [id]: values }
          }),
          detaching
        )
      })
    }

    _formatRecordsList(records) {
      return mapWithKeys(records, (attributes, id) => {
        if (isString(attributes)) {
          return { attributes: [] }
        }
        return { [id]: attributes }
      })
    }

    _attachNew(records, current, touch = true) {
      const changes = {
        attached: [],
        updated: [],
      }
      for (const [id, attributes] of Object.entries(records)) {
        if (!current.includes(id)) {
          this.attach(id, attributes, touch)
          changes['attached'].push(this._castKey(id))
        } else if (
          attributes.length > 0 &&
          this.updateExistingPivot(id, attributes, touch)
        ) {
          changes['updated'].push(this._castKey(id))
        }
      }
      return changes
    }

    updateExistingPivot(id, attributes, touch = true) {
      return __awaiter(this, void 0, void 0, function* () {
        if (
          this._using &&
          !this._pivotWheres.length &&
          !this._pivotWhereIns.length &&
          !this._pivotWhereNulls.length
        ) {
          return this._updateExistingPivotUsingCustomClass(
            id,
            attributes,
            touch
          )
        }
        if (this._pivotColumns.includes(this.updatedAt())) {
          attributes = this._addTimestampsToAttachment(attributes, true)
        }
        const updated = yield this.newPivotStatementForId(
          this._parseId(id)
        ).update(this._castAttributes(attributes))
        if (touch) {
          yield this.touchIfTouching()
        }
        return updated
      })
    }

    _updateExistingPivotUsingCustomClass(id, attributes, touch) {
      return __awaiter(this, void 0, void 0, function* () {
        const pivot = (yield this._getCurrentlyAttachedPivots())
          .filter(
            (item) =>
              item[this._foreignPivotKey] ==
              this._parent.getAttribute(this._parentKey)
          )
          .filter((item) => item[this._relatedPivotKey] == this._parseId(id))
          .pop()
        const updated = pivot ? pivot.fill(attributes).isDirty() : false
        if (updated) {
          yield pivot.save()
        }
        if (touch) {
          yield this.touchIfTouching()
        }
        return updated
      })
    }

    attach(id, attributes = {}, touch = true) {
      return __awaiter(this, void 0, void 0, function* () {
        if (this._using) {
          yield this._attachUsingCustomClass(id, attributes)
        } else {
          yield this.newPivotStatement().insert(
            this._formatAttachRecords(this._parseIds(id), attributes)
          )
        }
        if (touch) {
          yield this.touchIfTouching()
        }
      })
    }

    _attachUsingCustomClass(id, attributes) {
      return __awaiter(this, void 0, void 0, function* () {
        const records = this._formatAttachRecords(
          this._parseIds(id),
          attributes
        )
        for (const record of records) {
          yield this.newPivot(record, false).save()
        }
      })
    }

    _formatAttachRecords(ids, attributes) {
      const records = []
      const hasTimestamps =
        this.hasPivotColumn(this.createdAt()) ||
        this.hasPivotColumn(this.updatedAt())
      for (const [key, value] of Object.entries(ids)) {
        records.push(
          this._formatAttachRecord(key, value, attributes, hasTimestamps)
        )
      }
      return records
    }

    _formatAttachRecord(key, value, attributes, hasTimestamps) {
      let id
      ;[id, attributes] = this._extractAttachIdAndAttributes(
        key,
        value,
        attributes
      )
      return Object.assign(
        Object.assign({}, this._baseAttachRecord(id, hasTimestamps)),
        this._castAttributes(attributes)
      )
    }

    _extractAttachIdAndAttributes(key, value, attributes) {
      return isArray(value)
        ? [key, Object.assign(Object.assign({}, value), attributes)]
        : [value, attributes]
    }

    _baseAttachRecord(id, timed) {
      let record = {}
      record[this._relatedPivotKey] = id
      record[this._foreignPivotKey] = this._parent.getAttribute(this._parentKey)
      if (timed) {
        record = this._addTimestampsToAttachment(record)
      }
      for (const value of this._pivotValues) {
        record[value['column']] = value['value']
      }
      return record
    }

    _addTimestampsToAttachment(record, exists = false) {
      let fresh = this.parent.freshTimestamp()
      if (this.using) {
        const pivotModel = new this._using()
        fresh = fresh.format(pivotModel.getDateFormat())
      }
      if (!exists && this.hasPivotColumn(this.createdAt())) {
        record[this.createdAt()] = fresh
      }
      if (this.hasPivotColumn(this.updatedAt())) {
        record[this.updatedAt()] = fresh
      }
      return record
    }

    hasPivotColumn(column) {
      return this._pivotColumns.includes(column)
    }

    detach(ids = null, touch = true) {
      return __awaiter(this, void 0, void 0, function* () {
        let results
        if (
          this.using &&
          ids.length &&
          !this._pivotWheres.length &&
          !this._pivotWhereIns.length &&
          !this._pivotWhereNulls.length
        ) {
          results = this._detachUsingCustomClass(ids)
        } else {
          const query = this.newPivotQuery()
          if (!isBlank(ids)) {
            ids = this._parseIds(ids)
            if (!ids.length) {
              return 0
            }
            query.whereIn(this.getQualifiedRelatedPivotKeyName(), ids)
          }
          results = yield query.delete()
        }
        if (touch) {
          yield this.touchIfTouching()
        }
        return results
      })
    }

    _detachUsingCustomClass(ids) {
      return __awaiter(this, void 0, void 0, function* () {
        let results = 0
        for (const id of this._parseIds(ids)) {
          results += yield this.newPivot(
            {
              [this._foreignPivotKey]: this._parent.getAttribute(
                this._parentKey
              ),
              [this._relatedPivotKey]: id,
            },
            true
          ).delete()
        }
        return results
      })
    }

    _getCurrentlyAttachedPivots() {
      return __awaiter(this, void 0, void 0, function* () {
        return (yield this.newPivotQuery().get()).map((record) => {
          const clazz = this._using
          const pivot = clazz.fromRawAttributes(
            this.parent,
            record,
            this.getTable(),
            true
          )
          return pivot.setPivotKeys(this.foreignPivotKey, this.relatedPivotKey)
        })
      })
    }

    newPivot(attributes = {}, exists = false) {
      const pivot = newPivot(
        this._parent,
        attributes,
        this._table,
        exists,
        this._using
      )
      return pivot.setPivotKeys(this._foreignPivotKey, this._relatedPivotKey)
    }

    newExistingPivot(attributes = []) {
      return this.newPivot(attributes, true)
    }

    newPivotStatement() {
      return this._query.getQuery().newQuery().from(this._table)
    }

    newPivotStatementForId(id) {
      return this.newPivotQuery().whereIn(
        this._relatedPivotKey,
        this._parseIds(id)
      )
    }

    newPivotQuery() {
      const query = this.newPivotStatement()
      for (const args of this._pivotWheres) {
        query.where(...args)
      }
      for (const args of this._pivotWhereIns) {
        query.whereIn(...args)
      }
      for (const args of this._pivotWhereNulls) {
        query.whereNull(...args)
      }
      return query.where(
        this.getQualifiedForeignPivotKeyName(),
        this._parent.getAttribute(this._parentKey)
      )
    }

    withPivot(columns, ...cols) {
      this._pivotColumns = [
        ...this._pivotColumns,
        ...(isArray(columns) ? columns : arguments),
      ]
      return this
    }

    _parseIds(value) {
      if (value instanceof BaseModel) {
        return [value.getAttribute(this._relatedKey)]
      }
      if (isArray(value)) {
        return value.map((it) => it.getAttribute(this._relatedKey))
      }

      return wrap(value)
    }

    _parseId(value) {
      return value instanceof BaseModel
        ? value.getAttribute(this._relatedKey)
        : value
    }

    _castKeys(keys) {
      return keys.map((v) => {
        return this._castKey(v)
      })
    }

    _castKey(key) {
      return this._getTypeSwapValue(this._related.getKeyType(), key)
    }

    _castAttributes(attributes) {
      return this._using
        ? this.newPivot().fill(attributes).getAttributes()
        : attributes
    }

    _getTypeSwapValue(type, value) {
      switch (type.toLowerCase()) {
        case 'int':
        case 'integer':
          return +value
        case 'real':
        case 'float':
        case 'double':
          return +value
        case 'string':
          return `${value}`
        default:
          return value
      }
    }
  }
}
