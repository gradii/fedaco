/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/nanofn';
import type { Collection } from '../../define/collection';
import type { JoinClauseBuilder } from '../../query-builder/query-builder';
import type { FedacoBuilder } from '../fedaco-builder';
import type { Model } from '../model';
import { mixinCanBeOneOfMany } from './concerns/can-be-one-of-many';
import { mixinComparesRelatedModels } from './concerns/compares-related-models';
import { mixinSupportsDefaultModels } from './concerns/supports-default-models';
import { HasOneOrMany } from './has-one-or-many';

export class HasOne extends mixinComparesRelatedModels(mixinCanBeOneOfMany(mixinSupportsDefaultModels(HasOneOrMany))) {
  public supportsPartialRelations = true;

  /* Get the results of the relationship. */
  public async getResults(): Promise<Model> {
    if (isBlank(this.getParentKey())) {
      return this._getDefaultFor(this._parent);
    }
    return ((await this._query.first()) as Model) || this._getDefaultFor(this._parent);
  }

  /* Initialize the relation on a set of models. */
  public initRelation(models: Model[], relation: string) {
    for (const model of models) {
      model.SetRelation(relation, this._getDefaultFor(model));
    }
    return models;
  }

  /* Match the eagerly loaded results to their parents. */
  public match(models: Model[], results: Collection, relation: string) {
    return this.matchOne(models, results, relation);
  }

  /* Add the constraints for an internal relationship existence query.

  Essentially, these queries compare on column names like "whereColumn". */
  public getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder, columns: any[] | any = ['*']) {
    if (this.isOneOfMany()) {
      this._mergeOneOfManyJoinsTo(query);
    }
    return super.getRelationExistenceQuery(query, parentQuery, columns);
  }

  /* Add constraints for inner join subselect for one of many relationships. */
  public addOneOfManySubQueryConstraints(
    query: FedacoBuilder,
    column: string | null = null,
    aggregate: string | null = null,
  ) {
    query.addSelect(this._foreignKey);
  }

  /* Get the columns that should be selected by the one of many subquery. */
  public getOneOfManySubQuerySelectColumns() {
    return this._foreignKey;
  }

  /* Add join query constraints for one of many relationships. */
  public addOneOfManyJoinSubQueryConstraints(join: JoinClauseBuilder) {
    join.on(this._qualifySubSelectColumn(this._foreignKey), '=', this._qualifyRelatedColumn(this._foreignKey));
  }

  /* Make a new related instance for the given model. */
  public newRelatedInstanceFor(parent: Model) {
    return this._related.NewInstance().SetAttribute(this.getForeignKeyName(), parent.GetAttribute(this._localKey));
  }

  /* Get the value of the model's foreign key. */
  _getRelatedKeyFrom(model: Model) {
    return model.GetAttribute(this.getForeignKeyName());
  }
}
