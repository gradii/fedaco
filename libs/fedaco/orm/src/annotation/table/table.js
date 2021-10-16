import { makeDecorator } from '@gradii/annotation'
import { FedacoColumn } from '../column'
export const Table = makeDecorator(
  'Fedaco:Table',
  (p) => Object.assign({}, p),
  FedacoColumn
)
