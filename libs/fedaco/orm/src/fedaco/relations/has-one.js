import { __awaiter } from 'tslib';
import { isBlank } from '@gradii/check-type';
import { mixinCanBeOneOfMany } from './concerns/can-be-one-of-many';
import { mixinComparesRelatedModels } from './concerns/compares-related-models';
import { mixinSupportsDefaultModels } from './concerns/supports-default-models';
import { HasOneOrMany } from './has-one-or-many';

export class HasOne extends mixinComparesRelatedModels(mixinCanBeOneOfMany(mixinSupportsDefaultModels(HasOneOrMany))) {
  constructor() {
    super(...arguments);
    this.supportsPartialRelations = true;
  }

  getResults() {
    return __awaiter(this, void 0, void 0, function* () {
      if (isBlank(this.getParentKey())) {
        return this._getDefaultFor(this._parent);
      }
      return (yield this._query.first()) || this._getDefaultFor(this._parent);
    });
  }

  initRelation(models, relation) {
    for (const model of models) {
      model.setRelation(relation, this._getDefaultFor(model));
    }
    return models;
  }

  match(models, results, relation) {
    return this.matchOne(models, results, relation);
  }

  getRelationExistenceQuery(query, parentQuery, columns = ['*']) {
    if (this.isOneOfMany()) {
      this.mergeOneOfManyJoinsTo(query);
    }
    return super.getRelationExistenceQuery(query, parentQuery, columns);
  }

  addOneOfManySubQueryConstraints(query, column = null, aggregate = null) {
    query.addSelect(this.foreignKey);
  }

  getOneOfManySubQuerySelectColumns() {
    return this.foreignKey;
  }

  addOneOfManyJoinSubQueryConstraints(join) {
    join.on(this.qualifySubSelectColumn(this.foreignKey), '=', this.qualifyRelatedColumn(this.foreignKey));
  }

  newRelatedInstanceFor(parent) {
    return this._related.newInstance()
      .setAttribute(this.getForeignKeyName(), parent[this.localKey]);
  }

  getRelatedKeyFrom(model) {
    return model.getAttribute(this.getForeignKeyName());
  }
}
