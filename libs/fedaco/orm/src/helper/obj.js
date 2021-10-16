import { has, isArray, isBlank, isNumber } from '@gradii/check-type'
import { value } from './fn'

export function get(target, key, defaultValue) {
  var _a
  if (isBlank(key)) {
    return target
  }
  if (isArray(target)) {
    if (isNumber(key)) {
      return target[Math.floor(key)]
    } else if (/^\d+$/g.exec(key)) {
      return target[parseInt(key)]
    }
  }
  key = `${key}`
  if (key in target) {
    return target[key]
  }
  if (key.includes('.') === false) {
    return (_a = target[key]) !== null && _a !== void 0
      ? _a
      : value(defaultValue)
  }
  for (const segment of key.split('.')) {
    if (segment in target) {
      target = target[segment]
    } else {
      return value(defaultValue)
    }
  }
  return target
}

function _assocPath(obj, path, val) {
  if (path.length === 0) {
    return val
  }
  const idx = path[0]
  if (path.length > 1) {
    const nextObj =
      !isBlank(obj) && has(obj, idx) ? obj[idx] : isNumber(path[1]) ? [] : {}
    val = _assocPath(nextObj, Array.prototype.slice.call(path, 1), val)
  }
  obj[idx] = val
  return obj
}
function _disAssocPath(obj, path) {
  if (path.length === 0) {
    return
  }
  const idx = path[0]
  if (path.length > 1) {
    const nextObj =
      !isBlank(obj) && has(obj, idx) ? obj[idx] : isNumber(path[1]) ? [] : {}
    _disAssocPath(nextObj, Array.prototype.slice.call(path, 1))
  }
  delete obj[idx]
  return obj
}
export function set(target, key, data) {
  return _assocPath(target, key.split('.'), data)
}
export function except(target, keys) {
  for (const key of keys) {
    _disAssocPath(target, key.split('.'))
  }
  return target
}
