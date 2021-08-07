import {
  isArray,
  isBlank
} from '@gradii/check-type';
import { Identifier } from '../query/ast/identifier';
import { resolveForwardRef } from './forward-ref';


export function resolveIdentifier(identifier: Identifier | undefined): string | undefined {
  return identifier ? resolveForwardRef<string>(identifier.name) : undefined;
}

export function wrapToArray(value) {
  if (isBlank(value)) {
    return [];
  }

  return isArray(value) ? value : [value];
}