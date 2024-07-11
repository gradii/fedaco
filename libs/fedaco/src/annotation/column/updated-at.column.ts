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
import { DateColumn } from './date.column';
import { DatetimeColumn } from './datetime.column';

export type UpdatedAtColumnAnnotation = ColumnAnnotation

export const UpdatedAtColumn: FedacoDecorator<UpdatedAtColumnAnnotation> = makePropDecorator(
  'Fedaco:UpdatedAtColumn',
  (p: UpdatedAtColumnAnnotation = {}): UpdatedAtColumnAnnotation => ({fillable: false,...p}),
  DatetimeColumn,
  (target: any, name: string, decorator: UpdatedAtColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
    (target.constructor).UPDATED_AT = name
  });
