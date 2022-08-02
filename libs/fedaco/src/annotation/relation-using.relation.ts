/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import { _additionalProcessingGetter } from './additional-processing';
import type { FedacoDecorator } from './annotation.interface';
import type { ColumnAnnotation } from './column';
import type { RelationColumnAnnotation } from './relation-column';

export const RelationUsingColumn: FedacoDecorator<RelationColumnAnnotation> = makePropDecorator(
  'Fedaco:RelationUsingColumn',
  (p: ColumnAnnotation = {}): ColumnAnnotation => ({...p}), undefined,
  (target: any, name: string, columnDefine: ColumnAnnotation) => {
    _additionalProcessingGetter(target, name, columnDefine);
  });
