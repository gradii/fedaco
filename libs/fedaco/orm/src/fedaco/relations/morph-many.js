import { __awaiter } from 'tslib'
import { isBlank } from '@gradii/check-type'
import { MorphOneOrMany } from './morph-one-or-many'
export class MorphMany extends MorphOneOrMany {
  getResults() {
    return __awaiter(this, void 0, void 0, function* () {
      return !isBlank(this.getParentKey())
        ? yield this._query.get()
        : this._related.newCollection()
    })
  }

  initRelation(models, relation) {
    for (const model of models) {
      model.setRelation(relation, this._related.newCollection())
    }
    return models
  }

  match(models, results, relation) {
    return this.matchMany(models, results, relation)
  }
}
