import { __awaiter } from 'tslib'
import { isBlank } from '@gradii/check-type'
import { uniq } from 'ramda'
import { BaseModel } from '../base-model'
import { mixinComparesRelatedModels } from './concerns/compares-related-models'
import { mixinInteractsWithDictionary } from './concerns/interacts-with-dictionary'
import { mixinSupportsDefaultModels } from './concerns/supports-default-models'
import { Relation } from './relation'
export class BelongsTo extends mixinComparesRelatedModels(
  mixinInteractsWithDictionary(mixinSupportsDefaultModels(Relation))
) {
  constructor(query, child, foreignKey, ownerKey, relationName) {
    super(query, child)
    this._ownerKey = ownerKey
    this._relationName = relationName
    this._foreignKey = foreignKey
    this._child = child
    this.addConstraints()
  }

  getResults() {
    return __awaiter(this, void 0, void 0, function* () {
      if (isBlank(this._child.getAttribute(this._foreignKey))) {
        return this._getDefaultFor(this._parent)
      }
      return (yield this._query.first()) || this._getDefaultFor(this._parent)
    })
  }

  addConstraints() {
    if (this.constructor.constraints) {
      const table = this._related.getTable()
      this._query.where(
        `${table}.${this._ownerKey}`,
        '=',
        this._child.getAttribute(this._foreignKey)
      )
    }
  }

  addEagerConstraints(models) {
    const key = `${this._related.getTable()}.${this._ownerKey}`
    const whereIn = this._whereInMethod(this._related, this._ownerKey)
    this._query[whereIn](key, this.getEagerModelKeys(models))
  }

  getEagerModelKeys(models) {
    const keys = []
    for (const model of models) {
      const value = model.getAttribute(this._foreignKey)
      if (!isBlank(value)) {
        keys.push(value)
      }
    }

    return uniq(keys)
  }

  initRelation(models, relation) {
    for (const model of models) {
      model.setRelation(relation, this._getDefaultFor(model))
    }
    return models
  }

  match(models, results, relation) {
    const foreign = this._foreignKey
    const owner = this._ownerKey
    const dictionary = []
    for (const result of results) {
      const attribute = this._getDictionaryKey(result.getAttribute(owner))
      dictionary[attribute] = result
    }
    for (const model of models) {
      const attribute = this._getDictionaryKey(model.getAttribute(foreign))
      if (dictionary[attribute] !== undefined) {
        model.setRelation(relation, dictionary[attribute])
      }
    }
    return models
  }

  associate(model) {
    const ownerKey =
      model instanceof BaseModel ? model.getAttribute(this._ownerKey) : model
    this._child.setAttribute(this._foreignKey, ownerKey)
    if (model instanceof BaseModel) {
      this._child.setRelation(this._relationName, model)
    } else {
      this._child.unsetRelation(this._relationName)
    }
    return this._child
  }

  dissociate() {
    this._child.setAttribute(this._foreignKey, null)
    return this._child.setRelation(this._relationName, null)
  }

  disassociate() {
    return this.dissociate()
  }

  getRelationExistenceQuery(query, parentQuery, columns = ['*']) {
    if (parentQuery.getModel().getTable() == query.getModel().getTable()) {
      return this.getRelationExistenceQueryForSelfRelation(
        query,
        parentQuery,
        columns
      )
    }
    return query
      .select(columns)
      .whereColumn(
        this.getQualifiedForeignKeyName(),
        '=',
        query.qualifyColumn(this._ownerKey)
      )
  }

  getRelationExistenceQueryForSelfRelation(
    query,
    parentQuery,
    columns = ['*']
  ) {
    const hash = this.getRelationCountHash()
    query.select(columns).from(query.getModel().getTable() + ' as ' + hash)
    query.getModel().setTable(hash)
    return query.whereColumn(
      `${hash}.${this._ownerKey}`,
      '=',
      this.getQualifiedForeignKeyName()
    )
  }

  relationHasIncrementingId() {
    return (
      this._related.getIncrementing() &&
      ['int', 'integer'].includes(this._related.getKeyType())
    )
  }

  newRelatedInstanceFor(parent) {
    return this._related.newInstance()
  }

  getChild() {
    return this._child
  }

  getForeignKeyName() {
    return this._foreignKey
  }

  getQualifiedForeignKeyName() {
    return this._child.qualifyColumn(this._foreignKey)
  }

  getParentKey() {
    return this._child[this._foreignKey]
  }

  getOwnerKeyName() {
    return this._ownerKey
  }

  getQualifiedOwnerKeyName() {
    return this._related.qualifyColumn(this._ownerKey)
  }

  _getRelatedKeyFrom(model) {
    return model[this._ownerKey]
  }

  getRelationName() {
    return this._relationName
  }
}
