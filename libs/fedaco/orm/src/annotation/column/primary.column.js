/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { makePropDecorator } from '@gradii/annotation'
import { _additionalProcessingGetterSetter } from '../additional-processing'
import { FedacoColumn } from '../column'
export const PrimaryColumn = makePropDecorator(
  'Fedaco:PrimaryColumn',
  (p) => Object.assign({}, p),
  FedacoColumn,
  (target, key, decorator) => {
    _additionalProcessingGetterSetter(target, key, decorator)
    Object.defineProperty(target, '_primaryKey', {
      enumerable: false,
      configurable: true,
      value: decorator.field || key,
    })
    Object.defineProperty(target, '_keyType', {
      enumerable: false,
      configurable: true,
      value: decorator.keyType,
    })
  }
)
