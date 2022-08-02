/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Collection } from '../../define/collection';
import { HasOneOrMany } from './has-one-or-many';

export class HasMany extends HasOneOrMany {
  /*Get the results of the relationship.*/
  public getResults() {
    return this._query.get();
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
