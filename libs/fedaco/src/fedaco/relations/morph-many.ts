/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/check-type';
import type { Collection } from '../../define/collection';
import { MorphOneOrMany } from './morph-one-or-many';

export class MorphMany extends MorphOneOrMany {
  /*Get the results of the relationship.*/
  public async getResults() {
    return !isBlank(this.getParentKey()) ?
      await this._query.get() :
      this._related.newCollection();
  }

  /*Initialize the relation on a set of models.*/
  public initRelation(models: any[], relation: string) {
    for (const model of models) {
      model.setRelation(relation, this._related.newCollection());
    }
    return models;
  }

  /*Match the eagerly loaded results to their parents.*/
  public match(models: any[], results: Collection, relation: string) {
    return this.matchMany(models, results, relation);
  }
}
