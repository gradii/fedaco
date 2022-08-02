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

export const Column: FedacoDecorator<ColumnAnnotation> = makePropDecorator(
  'Fedaco:Column',
  (p: ColumnAnnotation = {}): ColumnAnnotation => ({...p}),
  FedacoColumn,
  (target: any, name: string, decorator: ColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
  });
