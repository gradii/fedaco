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

export type DatetimeColumnAnnotation = ColumnAnnotation;

export const DatetimeColumn: FedacoDecorator<DatetimeColumnAnnotation> = makePropDecorator(
  'Fedaco:DatetimeColumn',
  (p: DatetimeColumnAnnotation = {}): DatetimeColumnAnnotation => ({ fillable: true, ...p }),
  FedacoColumn,
  (target: any, name: string, decorator: DatetimeColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
  },
);
