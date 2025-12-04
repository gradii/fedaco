/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import type { FedacoBuilder } from '../fedaco/fedaco-builder';
import { _additionalProcessingGetter } from './additional-processing';
import type { FedacoDecorator } from './annotation.interface';

export interface ScopeAnnotation {
  isScope?: boolean;
  query: (query: FedacoBuilder, ...args: any[]) => void;
}

export const Scope: FedacoDecorator<Omit<ScopeAnnotation, 'isScope'>> = makePropDecorator(
  'fedaco orm scope column',
  (p: ScopeAnnotation): ScopeAnnotation => ({ isScope: true, ...p }),
  undefined,
  (target: any, name: string, decorator: any) => {
    _additionalProcessingGetter(target, name, decorator);
  },
);
