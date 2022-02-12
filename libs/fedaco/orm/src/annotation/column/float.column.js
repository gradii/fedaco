/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { makePropDecorator } from '@gradii/annotation'
import { _additionalProcessingGetterSetter } from '../additional-processing'
import { FedacoColumn } from '../column'
export const FloatColumn = makePropDecorator(
  'Fedaco:FloatColumn',
  (p = {}) => Object.assign({}, p),
  FedacoColumn,
  (target, name, decorator) => {
    _additionalProcessingGetterSetter(target, name, decorator)
  }
)
