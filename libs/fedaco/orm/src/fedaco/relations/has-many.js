import { HasOneOrMany } from './has-one-or-many';

export class HasMany extends HasOneOrMany {

  getResults() {
    return this._query.get();
  }

  initRelation(models, relation) {
    for (const model of models) {
      model.setRelation(relation, this._related.newCollection());
    }
    return models;
  }

  match(models, results, relation) {
    return this.matchMany(models, results, relation);
  }
}
