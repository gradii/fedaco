/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import { _additionalProcessingGetterSetter } from '../additional-processing';
import type { ColumnAnnotation } from '../column';
import { FedacoColumn } from '../column';

export interface PrimaryGeneratedColumnAnnotation extends ColumnAnnotation {
  field?: string;
  keyType: string | 'increment';
}

export const PrimaryGeneratedColumn = makePropDecorator(
  'Fedaco:PrimaryGeneratedColumn',
  (p: PrimaryGeneratedColumnAnnotation): PrimaryGeneratedColumnAnnotation => ({ fillable: true, ...p }),
  FedacoColumn,
  (target: any, key: string, decorator: any) => {
    _additionalProcessingGetterSetter(target, key, decorator);

    Object.defineProperty(target, '_primaryKey', {
      enumerable  : false,
      configurable: true,
      writable    : false,
      value       : decorator.field || key,
    });

    if (Object.prototype.hasOwnProperty.call(decorator, 'keyType')) {
      Object.defineProperty(target, '_keyType', {
        enumerable  : false,
        configurable: true,
        writable    : false,
        value       : decorator.keyType,
      });
    }
  },
);
