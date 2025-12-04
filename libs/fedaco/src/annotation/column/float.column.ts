/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import { _additionalProcessingGetterSetter } from '../additional-processing';
import type { FedacoDecorator } from '../annotation.interface';
import type { ColumnAnnotation } from '../column';
import { FedacoColumn } from '../column';

export type FloatColumnAnnotation = ColumnAnnotation;

export const FloatColumn: FedacoDecorator<FloatColumnAnnotation> = makePropDecorator(
  'Fedaco:FloatColumn',
  (p: FloatColumnAnnotation = {}): FloatColumnAnnotation => ({ fillable: true, ...p }),
  FedacoColumn,
  (target: any, name: string, decorator: FloatColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
  },
);
