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

export type DateColumnAnnotation = ColumnAnnotation

export const DateColumn: FedacoDecorator<DateColumnAnnotation> = makePropDecorator(
  'Fedaco:DateColumn',
  (p: DateColumnAnnotation = {}): DateColumnAnnotation => ({...p}),
  FedacoColumn,
  (target: any, name: string, decorator: DateColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
  });
