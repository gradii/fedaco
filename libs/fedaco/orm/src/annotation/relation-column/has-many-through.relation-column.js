import { makePropDecorator } from '@gradii/annotation'
import { HasManyThrough } from '../../fedaco/relations/has-many-through'
import { resolveForwardRef } from '../../query-builder/forward-ref'
import { _additionalProcessingGetter } from '../additional-processing'
import { FedacoRelationColumn } from '../relation-column'
export const HasManyThroughColumn = makePropDecorator(
  'Fedaco:HasManyThroughColumn',
  (p) =>
    Object.assign(
      {
        isRelation: true,
        type: 'HasManyThrough',
        _getRelation: function (m, relation) {
          const throughClazz = resolveForwardRef(p.through)
          const through = new throughClazz()
          const firstKey = p.firstKey || m.getForeignKey()
          const secondKey = p.secondKey || through.getForeignKey()
          const clazz = resolveForwardRef(p.related)
          const r = new HasManyThrough(
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
