/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import type { Model } from '../../fedaco/model';
import { _additionalProcessingGetterSetter } from '../additional-processing';
import type { FedacoDecorator } from '../annotation.interface';
import type { ColumnAnnotation } from '../column';
import { DatetimeColumn } from './datetime.column';

export type CreatedAtColumnAnnotation = ColumnAnnotation

export const CreatedAtColumn: FedacoDecorator<CreatedAtColumnAnnotation> = makePropDecorator(
  'Fedaco:CreatedAtColumn',
  (p: CreatedAtColumnAnnotation = {}): CreatedAtColumnAnnotation => ({fillable: false, ...p}),
  DatetimeColumn,
  (target: any, name: string, decorator: CreatedAtColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
    (target.constructor).CREATED_AT = name
  });
