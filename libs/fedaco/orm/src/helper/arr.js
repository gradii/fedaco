import { isArray } from '@gradii/check-type'
export function wrap(value) {
  return isArray(value) ? value : [value]
}
export function mapWithKeys(items, callback) {
  const result = {}
  for (const [key, value] of Object.entries(items)) {
    const assoc = callback(value, key)
    for (const [mapKey, mapValue] of Object.entries(assoc)) {
      result[mapKey] = mapValue
    }
  }
  return result
}
