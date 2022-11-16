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

export type IntegerColumnAnnotation = ColumnAnnotation

export const IntegerColumn: FedacoDecorator<IntegerColumnAnnotation> = makePropDecorator(
  'Fedaco:IntegerColumn',
  (p: IntegerColumnAnnotation = {}): IntegerColumnAnnotation => ({fillable: true,...p}),
  FedacoColumn,
  (target: any, name: string, decorator: IntegerColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
  });
