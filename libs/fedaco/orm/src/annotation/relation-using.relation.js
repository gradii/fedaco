import { makePropDecorator } from '@gradii/annotation';
import { _additionalProcessingGetter } from './additional-processing';

export const RelationUsingColumn = makePropDecorator('Fedaco:RelationUsingColumn', (p = {}) => (Object.assign({}, p)), undefined, (target, name, columnDefine) => {
  _additionalProcessingGetter(target, name, columnDefine);
});
