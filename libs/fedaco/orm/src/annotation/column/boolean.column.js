import { makePropDecorator } from '@gradii/annotation';
import { _additionalProcessingGetterSetter } from '../additional-processing';
import { FedacoColumn } from '../column';

export const BooleanColumn = makePropDecorator('Fedaco:BooleanColumn', (p = {}) => (Object.assign({}, p)), FedacoColumn, (target, name, decorator) => {
  _additionalProcessingGetterSetter(target, name, decorator);
});
