import { makePropDecorator } from '@gradii/annotation'
import { _additionalProcessingGetterSetter } from '../additional-processing'
import { DatetimeColumn } from './datetime.column'
export const UpdatedAtColumn = makePropDecorator(
  'Fedaco:UpdatedAtColumn',
  (p = {}) => Object.assign({}, p),
  DatetimeColumn,
  (target, name, decorator) => {
    _additionalProcessingGetterSetter(target, name, decorator)
  }
)
