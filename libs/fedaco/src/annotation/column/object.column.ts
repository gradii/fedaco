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

export interface ObjectColumnAnnotation extends ColumnAnnotation {
  isEncrypted?: boolean;
}

export const ObjectColumn: FedacoDecorator<ObjectColumnAnnotation> = makePropDecorator(
  'Fedaco:ObjectColumn',
  (p: ObjectColumnAnnotation = {}): ObjectColumnAnnotation => ({ fillable: true, ...p }),
  FedacoColumn,
  (target: any, name: string, decorator: ObjectColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
  },
);
