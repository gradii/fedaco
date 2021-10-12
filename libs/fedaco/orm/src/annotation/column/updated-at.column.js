import { makePropDecorator } from '@gradii/annotation';
import { _additionalProcessingGetterSetter } from '../additional-processing';
import { DateColumn } from './date.column';

export const UpdatedAtColumn = makePropDecorator('Fedaco:UpdatedAtColumn', (p = {}) => (Object.assign({}, p)), DateColumn, (target, name, decorator) => {
  _additionalProcessingGetterSetter(target, name, decorator);
});
