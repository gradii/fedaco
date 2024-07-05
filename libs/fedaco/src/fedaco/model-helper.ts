/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { pick } from 'ramda';
import { wrap } from '../helper/arr';
import { except } from '../helper/obj';
import type { Model } from './model';

export async function loadAggregate(models: any[], relations: any, column: string,
  func?: ((...args: any[]) => any) | string) {
  models = wrap(models);
  if (!models.length) {
    return [];
  }

  const first = models[0];

  const _models = await first.NewModelQuery()
    .whereKey(models.map(it => it.GetKey()))
    .select(first.GetKeyName())
    .withAggregate(relations, column, func)
    .get()

  const _attributes = except(
    Object.keys(_models[0].GetAttributes()),
    _models[0].GetKeyName()
  );
  for (const model of models) {
    const extraAttributes = pick(
      _attributes,
      _models.find((it: Model) => it.GetAttribute(first.GetKeyName()) === model.GetKey()).GetAttributes()
    );

    model.ForceFill(extraAttributes).SyncOriginalAttributes(_attributes);
  }
  return models;
}
