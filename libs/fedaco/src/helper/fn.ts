/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isFunction } from '@gradii/nanofn';


export function value(val: any | Function, ...args: any[]) {
  return isFunction(val) ? val(...args) : val;
}
