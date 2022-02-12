import { isFunction, isObject } from '@gradii/check-type'
export function mixinSupportsDefaultModels(base) {
  return class _Self extends base {
    withDefault(callback = true) {
      this._withDefault = callback
      return this
    }
    newRelatedInstanceFor(parent) {
      throw new Error('not implement')
    }

    _getDefaultFor(parent) {
      if (!this._withDefault) {
        return null
      }
      const instance = this.newRelatedInstanceFor(parent)
      if (isFunction(this._withDefault)) {
        return this._withDefault.call(this, instance, parent) || instance
      }
      if (isObject(this._withDefault)) {
        instance.forceFill(this._withDefault)
      }
      return instance
    }
  }
}
