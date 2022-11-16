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

export interface BinaryColumnAnnotation extends ColumnAnnotation {
  length?: number;
  isEncrypted?: boolean;
}

export const BinaryColumn: FedacoDecorator<BinaryColumnAnnotation> = makePropDecorator(
  'Fedaco:BinaryColumn',
  (p: BinaryColumnAnnotation = {}): BinaryColumnAnnotation => ({fillable: true,...p}),
  FedacoColumn,
  (target: any, name: string, decorator: BinaryColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
  });
