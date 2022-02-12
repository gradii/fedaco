/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { makePropDecorator } from '@gradii/annotation'
import { _additionalProcessingGetterSetter } from '../additional-processing'
import { FedacoColumn } from '../column'
export const TimestampColumn = makePropDecorator(
  'Fedaco:TimestampColumn',
  (p) => Object.assign({}, p),
  FedacoColumn,
  (target, key, decorator) => {
    _additionalProcessingGetterSetter(target, key, decorator)
  }
)
