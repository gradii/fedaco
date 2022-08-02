/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Model } from '../model';
import type { AsPivot } from './concerns/as-pivot';
import type { ForwardRefFn} from '../../query-builder/forward-ref';
import { resolveForwardRef } from '../../query-builder/forward-ref';
import type { Pivot } from './pivot';

export function fromAttributes(clazz: typeof AsPivot | ForwardRefFn<typeof AsPivot>, parent: Model, attributes: any, table: string,
                               exists = false) {
  clazz = resolveForwardRef(clazz);
  // @ts-ignore
  const instance: Model & Pivot = new clazz();
  instance._timestamps = instance.hasTimestampAttributes(attributes);
  instance.setConnection(parent.getConnectionName())
    .setTable(table)
    .forceFill(attributes)
    .syncOriginal();
  instance.pivotParent = parent;
  instance._exists = exists;
  return instance;
}

export function fromRawAttributes(clazz: typeof AsPivot | ForwardRefFn<typeof AsPivot>, parent: Model, attributes: any, table: string,
                                  exists = false) {
  const instance: Model = fromAttributes(clazz, parent, [], table, exists);
  instance._timestamps = instance.hasTimestampAttributes(attributes);
  instance.setRawAttributes(attributes, exists);
  return instance;
}
