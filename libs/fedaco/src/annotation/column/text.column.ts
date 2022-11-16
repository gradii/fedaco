/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import { _additionalProcessingGetterSetter } from '../additional-processing';
import type { ColumnAnnotation} from '../column';
import { FedacoColumn } from '../column';


export interface TextColumnAnnotation extends ColumnAnnotation {

  isEncrypted?: boolean;
}

export const TextColumn = makePropDecorator(
  'Fedaco:TextColumn',
  (p: TextColumnAnnotation): TextColumnAnnotation => ({fillable: true,...p}),
  FedacoColumn,
  (target: any, key: string, decorator: TextColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, key, decorator);
  });
