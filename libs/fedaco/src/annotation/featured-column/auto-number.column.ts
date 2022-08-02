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

export type AutoNumberColumnAnnotation = ColumnAnnotation

export const AutoNumberColumn: FedacoDecorator<AutoNumberColumnAnnotation> = makePropDecorator(
  'Fedaco:AutoNumberColumn',
  (p: AutoNumberColumnAnnotation = {}): AutoNumberColumnAnnotation => ({...p}),
  FedacoColumn,
  (target: any, name: string, columnDefine: AutoNumberColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, columnDefine);
  });
