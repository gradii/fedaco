import { isObject } from '@gradii/check-type'
export function mixinInteractsWithDictionary(base) {
  return class _Self extends base {
    _getDictionaryKey(attribute) {
      if (isObject(attribute)) {
        if ('__toString' in attribute) {
          return attribute.__toString()
        }
        throw new Error(`InvalidArgumentException(
          'Model attribute value is an object but does not have a __toString method.')`)
      }
      return attribute
    }
  }
}
