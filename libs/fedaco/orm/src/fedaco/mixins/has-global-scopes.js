import { isBlank } from '@gradii/check-type'
const globalScopes = new WeakMap()
export function mixinHasGlobalScopes(base) {
  return class _Self extends base {
    static addGlobalScope(scope, implementation) {
      let targetScopes = globalScopes.get(this)
      if (!targetScopes) {
        targetScopes = {}
        globalScopes.set(this, targetScopes)
      }
      return (targetScopes[scope] = implementation)
    }

    static hasGlobalScope(scope) {
      return !isBlank(this.getGlobalScope(scope))
    }

    static getGlobalScope(scope) {
      const target = globalScopes.get(this)
      if (target) {
        return target[scope]
      }
      return undefined
    }

    getGlobalScopes() {
      const target = globalScopes.get(this.constructor)
      return target || []
    }
  }
}
