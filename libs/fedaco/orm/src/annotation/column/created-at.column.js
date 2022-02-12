import { makePropDecorator } from '@gradii/annotation'
import { _additionalProcessingGetterSetter } from '../additional-processing'
import { DatetimeColumn } from './datetime.column'
export const CreatedAtColumn = makePropDecorator(
  'Fedaco:CreatedAtColumn',
  (p = {}) => Object.assign({}, p),
  DatetimeColumn,
  (target, name, decorator) => {
    _additionalProcessingGetterSetter(target, name, decorator)
  }
)
