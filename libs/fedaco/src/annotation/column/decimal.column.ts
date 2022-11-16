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

export type DecimalColumnAnnotation = ColumnAnnotation

export const DecimalColumn: FedacoDecorator<DecimalColumnAnnotation> = makePropDecorator(
  'Fedaco:DecimalColumn',
  (p: DecimalColumnAnnotation = {}): DecimalColumnAnnotation => ({fillable: true,...p}),
  FedacoColumn,
  (target: any, name: string, decorator: DecimalColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
  });
