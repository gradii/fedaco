/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray } from '@gradii/nanofn';
import type { Collection } from '../../define/collection';
import type { Model } from '../model';
import { mixinInteractsWithDictionary } from './concerns/interacts-with-dictionary';
import { mixinSupportsDefaultModels } from './concerns/supports-default-models';
import { HasManyThrough } from './has-many-through';

export class HasOneThrough extends mixinInteractsWithDictionary(mixinSupportsDefaultModels(HasManyThrough)) {
  /* Get the results of the relationship. */
  public async getResults(): Promise<Model> {
    return (await this.first()) || this._getDefaultFor(this._farParent);
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
    const dictionary = this._buildDictionary(results);
    for (const model of models) {
      const key = this._getDictionaryKey(model.GetAttribute(this._localKey));
      if (dictionary[key] !== undefined) {
        const value = dictionary[key];
        model.SetRelation(relation, isArray(value) ? value[0] : value);
      }
    }
    return models;
  }

  /* Make a new related instance for the given model. */
  public newRelatedInstanceFor(parent: Model) {
    return this._related.NewInstance();
  }
}
