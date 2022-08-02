/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import { _additionalProcessingGetterSetter } from '../additional-processing';
import type { ColumnAnnotation} from '../column';
import { FedacoColumn } from '../column';


export type TimestampColumnAnnotation = ColumnAnnotation

export const TimestampColumn = makePropDecorator(
  'Fedaco:TimestampColumn',
  (p: TimestampColumnAnnotation): TimestampColumnAnnotation => ({...p}),
  FedacoColumn,
  (target: any, key: string, decorator: TimestampColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, key, decorator);
  });
