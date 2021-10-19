import { __awaiter } from 'tslib'
import { isBlank } from '@gradii/check-type'
import { mixinCanBeOneOfMany } from './concerns/can-be-one-of-many'
import { mixinComparesRelatedModels } from './concerns/compares-related-models'
import { mixinSupportsDefaultModels } from './concerns/supports-default-models'
import { MorphOneOrMany } from './morph-one-or-many'
export class MorphOne extends mixinCanBeOneOfMany(
  mixinComparesRelatedModels(mixinSupportsDefaultModels(MorphOneOrMany))
) {
  constructor() {
    super(...arguments)
    this.supportsPartialRelations = true
  }

  getResults() {
    return __awaiter(this, void 0, void 0, function* () {
      if (isBlank(this.getParentKey())) {
        return this._getDefaultFor(this._parent)
      }
      return (yield this._query.first()) || this._getDefaultFor(this._parent)
    })
  }

  initRelation(models, relation) {
    for (const model of models) {
      model.setRelation(relation, this._getDefaultFor(model))
    }
    return models
  }

  match(models, results, relation) {
    return this.matchOne(models, results, relation)
  }

  getRelationExistenceQuery(query, parentQuery, columns = ['*']) {
    if (this.isOneOfMany()) {
      this.mergeOneOfManyJoinsTo(query)
    }
    return super.getRelationExistenceQuery(query, parentQuery, columns)
  }

  addOneOfManySubQueryConstraints(query, column = null, aggregate = null) {
    query.addSelect(this._foreignKey, this.morphType)
  }

  getOneOfManySubQuerySelectColumns() {
    return [this._foreignKey, this.morphType]
  }

  addOneOfManyJoinSubQueryConstraints(join) {
    join
      .on(
        this._qualifySubSelectColumn(this.morphType),
        '=',
        this.qualifyRelatedColumn(this.morphType)
      )
      .on(
        this._qualifySubSelectColumn(this._foreignKey),
        '=',
        this.qualifyRelatedColumn(this._foreignKey)
      )
  }

  newRelatedInstanceFor(parent) {
    return this._related
      .newInstance()
      .setAttribute(this.getForeignKeyName(), parent[this._localKey])
      .setAttribute(this.getMorphType(), this.morphClass)
  }

  _getRelatedKeyFrom(model) {
    return model.getAttribute(this.getForeignKeyName())
  }
}
