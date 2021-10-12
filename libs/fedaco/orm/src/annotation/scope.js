import { makePropDecorator } from '@gradii/annotation';
import { _additionalProcessingGetter } from './additional-processing';

export const Scope = makePropDecorator('fedaco orm scope column', (p) => (Object.assign({ isScope: true }, p)), undefined, (target, name, decorator) => {
  _additionalProcessingGetter(target, name, decorator);
});
