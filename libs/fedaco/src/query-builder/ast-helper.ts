/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray, isBlank } from '@gradii/nanofn';
import type { Identifier } from '../query/ast/identifier';
import { resolveForwardRef } from './forward-ref';


export function resolveIdentifier(identifier: Identifier | undefined): string | undefined {
  return identifier ? resolveForwardRef<string>(identifier.name) : undefined;
}

export function wrapToArray(value: any | any[]) {
  if (isBlank(value)) {
    return [];
  }

  return isArray(value) ? value : [value];
}
