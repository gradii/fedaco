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

export interface JsonColumnAnnotation extends ColumnAnnotation {
  isEncrypted?: boolean;
}

export const JsonColumn: FedacoDecorator<JsonColumnAnnotation> = makePropDecorator(
  'Fedaco:JsonColumn',
  (p: JsonColumnAnnotation = {}): JsonColumnAnnotation => ({ fillable: true, ...p }),
  FedacoColumn,
  (target: any, name: string, decorator: JsonColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
  },
);
