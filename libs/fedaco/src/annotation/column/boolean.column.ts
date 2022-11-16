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

export type BooleanColumnAnnotation = ColumnAnnotation

export const BooleanColumn: FedacoDecorator<BooleanColumnAnnotation> = makePropDecorator(
  'Fedaco:BooleanColumn',
  (p: BooleanColumnAnnotation = {}): BooleanColumnAnnotation => ({fillable: true,...p}),
  FedacoColumn,
  (target: any, name: string, decorator: BooleanColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
  });
