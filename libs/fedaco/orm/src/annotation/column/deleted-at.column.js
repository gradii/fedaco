/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { makePropDecorator } from '@gradii/annotation'
import { _additionalProcessingGetterSetter } from '../additional-processing'
import { DatetimeColumn } from './datetime.column'
export const DeletedAtColumn = makePropDecorator(
  'Fedaco:DeletedAtColumn',
  (
    p = {
      hidden: true,
    }
  ) => Object.assign({}, p),
  DatetimeColumn,
  (target, name, decorator) => {
    _additionalProcessingGetterSetter(target, name, decorator)
  }
)
