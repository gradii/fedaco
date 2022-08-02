/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import { _additionalProcessingGetterSetter } from '../additional-processing';
import type { FedacoDecorator } from '../annotation.interface';
import type { ColumnAnnotation} from '../column';
import { FedacoColumn } from '../column';

export type ArrayColumnAnnotation = ColumnAnnotation

export const ArrayColumn: FedacoDecorator<ArrayColumnAnnotation> = makePropDecorator(
  'Fedaco:ArrayColumn',
  (p: ArrayColumnAnnotation = {}): ArrayColumnAnnotation => ({...p}),
  FedacoColumn,
  (target: any, name: string, decorator: ArrayColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
  });
