import { makePropDecorator } from '@gradii/annotation';
import { _additionalProcessingGetterSetter } from '../additional-processing';
import { DateColumn } from './date.column';

export const DeletedAtColumn = makePropDecorator('Fedaco:DeletedAtColumn', (p = {}) => (Object.assign({}, p)), DateColumn, (target, name, decorator) => {
  _additionalProcessingGetterSetter(target, name, decorator);
});
