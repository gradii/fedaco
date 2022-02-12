import { __awaiter } from 'tslib'
import { isArray } from '@gradii/check-type'
import { mixinInteractsWithDictionary } from './concerns/interacts-with-dictionary'
import { mixinSupportsDefaultModels } from './concerns/supports-default-models'
import { HasManyThrough } from './has-many-through'
export class HasOneThrough extends mixinInteractsWithDictionary(
  mixinSupportsDefaultModels(HasManyThrough)
) {
  getResults() {
    return __awaiter(this, void 0, void 0, function* () {
      return (yield this.first()) || this._getDefaultFor(this._farParent)
    })
  }

  initRelation(models, relation) {
    for (const model of models) {
      model.setRelation(relation, this._getDefaultFor(model))
    }
    return models
  }

  match(models, results, relation) {
    const dictionary = this._buildDictionary(results)
    for (const model of models) {
      const key = this._getDictionaryKey(model.getAttribute(this._localKey))
      if (dictionary[key] !== undefined) {
        const value = dictionary[key]
        model.setRelation(relation, isArray(value) ? value[0] : value)
      }
    }
    return models
  }

  newRelatedInstanceFor(parent) {
    return this._related.newInstance()
  }
}
