import { isFunction } from '@gradii/check-type'
import { UnionFragment } from '../../query/ast/fragment/union-fragment'
export function mixinUnion(base) {
  return class _Self extends base {
    union(query, all = false) {
      if (isFunction(query)) {
        query((query = this.newQuery()))
      }
      this._unions.push(new UnionFragment(query, all))
      return this
    }

    unionAll(query) {
      return this.union(query, true)
    }
  }
}
