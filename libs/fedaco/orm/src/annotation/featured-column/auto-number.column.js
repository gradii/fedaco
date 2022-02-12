/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { makePropDecorator } from '@gradii/annotation'
import { _additionalProcessingGetterSetter } from '../additional-processing'
import { FedacoColumn } from '../column'
export const AutoNumberColumn = makePropDecorator(
  'Fedaco:AutoNumberColumn',
  (p = {}) => Object.assign({}, p),
  FedacoColumn,
  (target, name, columnDefine) => {
    _additionalProcessingGetterSetter(target, name, columnDefine)
  }
)
