/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { has, isArray, isBlank, isNumber } from '@gradii/nanofn';
import { value } from './fn';

export function get(target: any[] | any, key?: string | number, defaultValue?: any) {
  if (isBlank(key)) {
    return target;
  }
  if (isArray(target)) {
    if (isNumber(key)) {
      return target[Math.floor(key)];
    } else if (/^\d+$/g.exec(key)) {
      return target[parseInt(key)];
    }
  }
  key = `${key}`;
  if (key in target) {
    return target[key];
  }
  if (key.includes('.') === false) {
    return target[key] ?? value(defaultValue);
  }
  for (const segment of key.split('.')) {
    if (segment in target) {
      target = target[segment];
    } else {
      return value(defaultValue);
    }
  }
  return target;
}

//
// export function has(array: any, keys: string | any[]) {
//   var keys = /*cast type array*/ keys;
//   if (!array || keys === []) {
//     return false;
//   }
//   for (let key of keys) {
//     var subKeyArray = array;
//     if (Arr.exists(array, key)) {
//       continue;
//     }
//     for (let segment of key.split(".")) {
//       if (Arr.accessible(subKeyArray) && Arr.exists(subKeyArray, segment)) {
//         var subKeyArray = subKeyArray[segment];
//       }
//       else {
//         return false;
//       }
//     }
//   }
//   return true;
// }


function _assocPath(obj: any, path: string[], val: any) {
  if (path.length === 0) {
    return val;
  }

  const idx = path[0];

  if (path.length > 1) {
    const nextObj = !isBlank(obj) && has(obj, idx) ?
      obj[idx] :
      isNumber(path[1]) ? [] : {};

    val = _assocPath(nextObj, Array.prototype.slice.call(path, 1), val);
  }
  obj[idx] = val;
  return obj;
}

function _disAssocPath(obj: any, path: string[]) {
  if (path.length === 0) {
    return;
  }

  const idx = path[0];

  if (path.length > 1) {
    const nextObj = !isBlank(obj) && has(obj, idx) ?
      obj[idx] :
      isNumber(path[1]) ? [] : {};

    _disAssocPath(nextObj, Array.prototype.slice.call(path, 1));
  }

  delete obj[idx];
  return obj;
}


export function set(target: any, key: string, data: any) {
  return _assocPath(target, key.split('.'), data);
}

export function except(target: any, keys: string[]) {
  for (const key of keys) {
    _disAssocPath(target, key.split('.'));
  }
  return target;
}
