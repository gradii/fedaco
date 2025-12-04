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

export type CurrencyColumnAnnotation = ColumnAnnotation;

export const CurrencyColumn: FedacoDecorator<CurrencyColumnAnnotation> = makePropDecorator(
  'Fedaco:CurrencyColumn',
  (p: CurrencyColumnAnnotation = {}): CurrencyColumnAnnotation => ({ fillable: true, ...p }),
  FedacoColumn,
  (target: any, name: string, decorator: CurrencyColumnAnnotation) => {
    _additionalProcessingGetterSetter(target, name, decorator);
  },
);
