/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/nanofn';
import type { Collection } from '../../define/collection';
import type { Model } from '../model';
import { MorphOneOrMany } from './morph-one-or-many';

export class MorphMany extends MorphOneOrMany {
  /* Get the results of the relationship. */
  public async getResults() {
    return !isBlank(this.getParentKey()) ? await this._query.get() : this._related.NewCollection();
  }

  /* Initialize the relation on a set of models. */
  public initRelation(models: Model[], relation: string) {
    for (const model of models) {
      model.setRelation(relation, this._related.NewCollection());
    }
    return models;
  }

  /* Match the eagerly loaded results to their parents. */
  public match(models: Model[], results: Collection, relation: string) {
    return this.matchMany(models, results, relation);
  }
}
