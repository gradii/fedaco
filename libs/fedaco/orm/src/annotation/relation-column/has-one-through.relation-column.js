/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { makePropDecorator } from '@gradii/annotation'
import { HasOneThrough } from '../../fedaco/relations/has-one-through'
import { resolveForwardRef } from '../../query-builder/forward-ref'
import { _additionalProcessingGetter } from '../additional-processing'
import { FedacoRelationColumn } from '../relation-column'
export const HasOneThroughColumn = makePropDecorator(
  'Fedaco:HasOneThrough',
  (p) =>
    Object.assign(
      {
        isRelation: true,
        type: 'HasOneThrough',
        _getRelation: function (m, relation) {
          const throughClazz = resolveForwardRef(p.through)
          const through = new throughClazz()
          const firstKey = p.firstKey || m.getForeignKey()
          const secondKey = p.secondKey || through.getForeignKey()
          const clazz = resolveForwardRef(p.related)
          const r = new HasOneThrough(
            m._newRelatedInstance(clazz).newQuery(),
            m,
            through,
            firstKey,
            secondKey,
            p.localKey || m.getKeyName(),
            p.secondLocalKey || through.getKeyName()
          )
          if (p.onQuery) {
            p.onQuery(r)
          }
          return r
        },
      },
      p
    ),
  FedacoRelationColumn,
  (target, name, decorator) => {
    _additionalProcessingGetter(target, name, decorator)
  }
)
