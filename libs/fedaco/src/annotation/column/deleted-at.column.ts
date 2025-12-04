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

export type DeletedAtColumnAnnotation = ColumnAnnotation;

export const DeletedAtColumn: FedacoDecorator<DeletedAtColumnAnnotation> = makePropDecorator(
  'Fedaco:DeletedAtColumn',
  (
    p: DeletedAtColumnAnnotation = {
      hidden: true,
    },
  ): DeletedAtColumnAnnotation => ({ fillable: false, ...p }),
  DatetimeColumn,
  (target: any, name: string, decorator: DeletedAtColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
    // @ts-ignore
    (target.constructor as typeof Model).DELETED_AT = name;
  },
);
