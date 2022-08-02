/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray } from '@gradii/check-type';

export function wrap(value: any[] | any) {
  return isArray(value) ? value : [value];
}

export function mapWithKeys(items: Record<string, any>,
                            callback: (value: any, key: string) => Record<string, any>) {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(items)) {
    const assoc = callback(value, key);
    for (const [mapKey, mapValue] of Object.entries(assoc)) {
      result[mapKey] = mapValue;
    }
  }
  return result;
}

function valueRetriever() {

}

function operatorForWhere() {

}
