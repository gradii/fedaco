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
import { MorphOneOrMany } from './morph-one-or-many';

export class MorphOne extends mixinCanBeOneOfMany(
  mixinComparesRelatedModels(
    mixinSupportsDefaultModels(
      MorphOneOrMany
    )
  )
) {

  public supportsPartialRelations = true;

  /*Get the results of the relationship.*/
  public async getResults() {
    if (isBlank(this.getParentKey())) {
      return this._getDefaultFor(this._parent);
    }
    return await this._query.first() || this._getDefaultFor(this._parent);
  }

  /*Initialize the relation on a set of models.*/
  public initRelation(models: Model[], relation: string) {
    for (const model of models) {
      model.$setRelation(relation, this._getDefaultFor(model));
    }
    return models;
  }

  /*Match the eagerly loaded results to their parents.*/
  public match(models: Model[], results: Collection, relation: string) {
    return this.matchOne(models, results, relation);
  }

  /*Get the relationship query.*/
  public getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder,
                                   columns: any[] | any = ['*']) {
    if (this.isOneOfMany()) {
      this.mergeOneOfManyJoinsTo(query);
    }
    return super.getRelationExistenceQuery(query, parentQuery, columns);
  }

  /*Add constraints for inner join subselect for one of many relationships.*/
  public addOneOfManySubQueryConstraints(query: FedacoBuilder, column: string | null = null,
                                         aggregate: string | null                    = null) {
    query.addSelect(this._foreignKey, this._morphType);
  }

  /*Get the columns that should be selected by the one of many subquery.*/
  public getOneOfManySubQuerySelectColumns() {
    return [this._foreignKey, this._morphType];
  }

  /*Add join query constraints for one of many relationships.*/
  public addOneOfManyJoinSubQueryConstraints(join: JoinClauseBuilder) {
    join.on(
      this._qualifySubSelectColumn(this._morphType),
      '=',
      this.qualifyRelatedColumn(this._morphType)
    ).on(
      this._qualifySubSelectColumn(this._foreignKey),
      '=',
      this.qualifyRelatedColumn(this._foreignKey)
    );
  }

  /*Make a new related instance for the given model.*/
  public newRelatedInstanceFor(parent: Model) {
    return this._related.$newInstance()
      .$setAttribute(this.getForeignKeyName(), parent[this._localKey])
      .$setAttribute(this.getMorphType(), this._morphClass);
  }

  /*Get the value of the model's foreign key.*/
  _getRelatedKeyFrom(model: Model) {
    return model.$getAttribute(this.getForeignKeyName());
  }
}
