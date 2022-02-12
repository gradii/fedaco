import { makePropDecorator } from '@gradii/annotation'
import { _additionalProcessingGetterSetter } from '../additional-processing'
import { FedacoColumn } from '../column'
export const PrimaryGeneratedColumn = makePropDecorator(
  'Fedaco:PrimaryGeneratedColumn',
  (p) => Object.assign({}, p),
  FedacoColumn,
  (target, key, decorator) => {
    _additionalProcessingGetterSetter(target, key, decorator)
  }
)
