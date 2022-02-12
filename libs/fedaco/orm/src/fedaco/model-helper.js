/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { __awaiter } from 'tslib'
import { pick } from 'ramda'
import { wrap } from '../helper/arr'
import { except } from '../helper/obj'
export function loadAggregate(models, relations, column, func) {
  return __awaiter(this, void 0, void 0, function* () {
    models = wrap(models)
    if (!models.length) {
      return []
    }
    const first = models[0]
    const _models = yield first
      .newModelQuery()
      .whereKey(models.map((it) => it.getKey()))
      .select(first.getKeyName())
      .withAggregate(relations, column, func)
      .get()
    const _attributes = except(
      Object.keys(_models[0].getAttributes()),
      _models[0].getKeyName()
    )
    for (const model of models) {
      const extraAttributes = pick(
        _attributes,
        _models
          .find((it) => it.getAttribute(first.getKeyName()) === model.getKey())
          .getAttributes()
      )
      model.forceFill(extraAttributes).syncOriginalAttributes(_attributes)
    }
    return models
  })
}
