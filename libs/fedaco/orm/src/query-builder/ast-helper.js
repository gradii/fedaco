import { isArray, isBlank } from '@gradii/check-type';
import { resolveForwardRef } from './forward-ref';

export function resolveIdentifier(identifier) {
  return identifier ? resolveForwardRef(identifier.name) : undefined;
}

export function wrapToArray(value) {
  if (isBlank(value)) {
    return [];
  }
  return isArray(value) ? value : [value];
}
