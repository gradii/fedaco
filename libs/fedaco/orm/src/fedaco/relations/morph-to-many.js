/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { __awaiter } from 'tslib'
import { isBlank } from '@gradii/check-type'
import { uniq } from 'ramda'
import { BelongsToMany } from './belongs-to-many'
import { MorphPivot } from './morph-pivot'
export class MorphToMany extends BelongsToMany {
  constructor(
    query,
    parent,
    name,
    table,
    foreignPivotKey,
    relatedPivotKey,
    parentKey,
    relatedKey,
    relationName = null,
    inverse = false
  ) {
    super(
      query,
      parent,
      table,
      foreignPivotKey,
      relatedPivotKey,
      parentKey,
      relatedKey,
      relationName
    )
    this._inverse = inverse
    this._morphType = name + '_type'
    this._morphClass = inverse
      ? query.getModel().getMorphClass()
      : parent.getMorphClass()
    this.addConstraints()
  }
  addConstraints() {
    if (this._morphType === undefined && this._morphClass === undefined) {
      return
    }
    super.addConstraints()
  }

  _addWhereConstraints() {
    super._addWhereConstraints()
    this._query.where(
      this.qualifyPivotColumn(this._morphType),
      this._morphClass
    )
    return this
  }

  addEagerConstraints(models) {
    super.addEagerConstraints(models)
    this._query.where(
      this.qualifyPivotColumn(this._morphType),
      this._morphClass
    )
  }

  _baseAttachRecord(id, timed) {
    const arr = super._baseAttachRecord(id, timed)
    if (isBlank(arr[this._morphType])) {
      arr[this._morphType] = this._morphClass
    }
    return arr
  }

  getRelationExistenceQuery(query, parentQuery, columns = ['*']) {
    return super
      .getRelationExistenceQuery(query, parentQuery, columns)
      .where(this.qualifyPivotColumn(this._morphType), this._morphClass)
  }

  _getCurrentlyAttachedPivots() {
    const _super = Object.create(null, {
      _getCurrentlyAttachedPivots: {
        get: () => super._getCurrentlyAttachedPivots,
      },
    })
    return __awaiter(this, void 0, void 0, function* () {
      return (yield _super._getCurrentlyAttachedPivots.call(this)).map(
        (record) => {
          return record instanceof MorphPivot
            ? record
                .setMorphType(this._morphType)
                .setMorphClass(this._morphClass)
            : record
        }
      )
    })
  }

  newPivotQuery() {
    return super.newPivotQuery().where(this._morphType, this._morphClass)
  }

  newPivot(attributes = [], exists = false) {
    const using = this._using
    const pivot = using
      ? using.fromRawAttributes(this._parent, attributes, this._table, exists)
      : MorphPivot.fromAttributes(this._parent, attributes, this._table, exists)
    pivot
      .setPivotKeys(this._foreignPivotKey, this._relatedPivotKey)
      .setMorphType(this._morphType)
      .setMorphClass(this._morphClass)
    return pivot
  }

  _aliasedPivotColumns() {
    const defaults = [
      this._foreignPivotKey,
      this._relatedPivotKey,
      this._morphType,
    ]
    return uniq(
      [...defaults, ...this._pivotColumns].map((column) => {
        return this.qualifyPivotColumn(column) + ' as pivot_' + column
      })
    )
  }

  getMorphType() {
    return this._morphType
  }

  getMorphClass() {
    return this._morphClass
  }

  getInverse() {
    return this._inverse
  }
}
