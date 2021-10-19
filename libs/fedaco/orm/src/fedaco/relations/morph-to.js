import { __awaiter } from 'tslib'
import { reflector } from '@gradii/annotation'
import { isBlank } from '@gradii/check-type'
import { findLast, tap } from 'ramda'
import { MorphToColumn } from '../../annotation/relation-column/morph-to.relation-column'
import { resolveForwardRef } from '../../query-builder/forward-ref'
import { Model } from '../model'
import { BelongsTo } from './belongs-to'
import { Relation } from './relation'
export class MorphTo extends BelongsTo {
  constructor(query, parent, foreignKey, ownerKey, type, relation) {
    super(query, parent, foreignKey, ownerKey, relation)

    this._dictionary = {}

    this._macroBuffer = []

    this._morphableEagerLoads = new Map()

    this._morphableEagerLoadCounts = new Map()

    this._morphableConstraints = new Map()
    this._morphType = type
  }

  select(columns = ['*']) {
    this._macroBuffer.push({
      method: 'select',
      parameters: [columns],
    })
    return super.select(columns)
  }

  selectRaw(expression, bindings = {}) {
    this._macroBuffer.push({
      method: 'selectRaw',
      parameters: [expression, bindings],
    })
    return super.selectRaw(expression, bindings)
  }

  selectSub(query, as) {
    this._macroBuffer.push({
      method: 'selectSub',
      parameters: [query, as],
    })
    return super.selectSub(query, as)
  }

  addSelect(column) {
    this._macroBuffer.push({
      method: 'addSelect',
      parameters: [column],
    })
    return super.addSelect(column)
  }

  withoutGlobalScopes(scopes) {
    this._macroBuffer.push({
      method: 'addSelect',
      parameters: [scopes],
    })
  }

  addEagerConstraints(models) {
    this.buildDictionary((this._models = models))
  }

  buildDictionary(models) {
    for (const model of models) {
      if (model._getAttributeFromArray(this._morphType)) {
        const morphTypeKey = this._getDictionaryKey(
          model._getAttributeFromArray(this._morphType)
        )
        const foreignKeyKey = this._getDictionaryKey(
          model._getAttributeFromArray(this._foreignKey)
        )
        let obj = this._dictionary[morphTypeKey]
        if (!obj) {
          obj = {}
          this._dictionary[morphTypeKey] = obj
          if (!obj[foreignKeyKey]) {
            obj[foreignKeyKey] = []
          }
        }
        obj[foreignKeyKey].push(model)
      }
    }
  }

  getEager() {
    return __awaiter(this, void 0, void 0, function* () {
      for (const type of Object.keys(this._dictionary)) {
        this.matchToMorphParents(type, yield this.getResultsByType(type))
      }
      return this._models
    })
  }

  getResultsByType(clazz) {
    var _a, _b, _c, _d
    return __awaiter(this, void 0, void 0, function* () {
      const instance = this.createModelByType(clazz)
      const ownerKey =
        (_a = this._ownerKey) !== null && _a !== void 0
          ? _a
          : instance.getKeyName()
      const query = this.replayMacros(instance.newQuery())
        .mergeConstraintsFrom(this.getQuery())
        .with(
          Object.assign(
            Object.assign({}, this.getQuery().getEagerLoads()),
            (_b = this._morphableEagerLoads.get(instance.constructor)) !==
              null && _b !== void 0
              ? _b
              : {}
          )
        )
        .withCount(
          (_c = this._morphableEagerLoadCounts.get(instance.constructor)) !==
            null && _c !== void 0
            ? _c
            : []
        )
      const callback =
        (_d = this._morphableConstraints.get(instance.constructor)) !== null &&
        _d !== void 0
          ? _d
          : null
      if (callback) {
        callback(query)
      }
      const whereIn = this._whereInMethod(instance, ownerKey)
      return query[whereIn](
        instance.getTable() + '.' + ownerKey,
        this.gatherKeysByType(clazz, instance.getKeyType())
      ).get()
    })
  }

  gatherKeysByType(type, keyType) {
    return keyType !== 'string'
      ? Object.keys(this._dictionary[type])
      : Object.keys(this._dictionary[type]).map((modelId) => {
          return modelId
        })
  }
  _getActualClassNameForMorph(key) {
    const morphMap = Relation.morphMap()
    if (key in morphMap) {
      return morphMap[key]
    }

    const metas = reflector.propMetadata(this._child.constructor)[
      this._morphType.replace(/_type$/, '')
    ]
    if (metas) {
      const meta = findLast((it) => MorphToColumn.isTypeOf(it), metas)
      const morphTypeMap = meta['morphTypeMap']
      if (morphTypeMap && morphTypeMap[key]) {
        return resolveForwardRef(morphTypeMap[key])
      }
    }
    throw new Error(
      `can't found morph map from [${key}] from Relation.morphMap and column decoration`
    )
  }

  createModelByType(type) {
    const clazz = this._getActualClassNameForMorph(type)

    return tap((instance) => {
      if (!instance.getConnectionName()) {
        instance.setConnection(this.getConnection().getName())
      }
    }, new clazz())
  }

  match(models, results, relation) {
    return models
  }

  matchToMorphParents(type, results) {
    for (const result of results) {
      const ownerKey = !isBlank(this._ownerKey)
        ? this._getDictionaryKey(result[this._ownerKey])
        : result.getKey()
      if (this._dictionary[type][ownerKey] !== undefined) {
        for (const model of this._dictionary[type][ownerKey]) {
          model.setRelation(this._relationName, result)
        }
      }
    }
  }

  associate(model) {
    let foreignKey
    if (model instanceof Model) {
      foreignKey =
        this._ownerKey && model[this._ownerKey]
          ? this._ownerKey
          : model.getKeyName()
    }
    this._parent.setAttribute(
      this._foreignKey,
      model instanceof Model ? model[foreignKey] : null
    )
    this._parent.setAttribute(
      this._morphType,
      model instanceof Model ? model.getMorphClass() : null
    )
    return this._parent.setRelation(this._relationName, model)
  }

  dissociate() {
    this._parent.setAttribute(this._foreignKey, null)
    this._parent.setAttribute(this._morphType, null)
    return this._parent.setRelation(this._relationName, null)
  }

  touch() {
    if (!isBlank(this._child._getAttributeFromArray(this._foreignKey))) {
      super.touch()
    }
  }

  newRelatedInstanceFor(parent) {
    return parent[this.getRelationName()]().getRelated().newInstance()
  }

  getMorphType() {
    return this._morphType
  }

  getDictionary() {
    return this._dictionary
  }

  morphWith(_with) {
    _with.forEach((k, v) => {
      this._morphableEagerLoads.set(k, v)
    })
    return this
  }

  morphWithCount(withCount) {
    withCount.forEach((k, v) => {
      this._morphableEagerLoadCounts.set(k, v)
    })
    return this
  }

  constrain(callbacks) {
    callbacks.forEach((k, v) => {
      this._morphableConstraints.set(k, v)
    })
    return this
  }

  replayMacros(query) {
    for (const macro of this._macroBuffer) {
      query[macro['method']](...macro['parameters'])
    }
    return query
  }
}
