import { isFunction } from '@gradii/check-type';

export function value(val, ...args) {
  return isFunction(val) ? val(...args) : val;
}
