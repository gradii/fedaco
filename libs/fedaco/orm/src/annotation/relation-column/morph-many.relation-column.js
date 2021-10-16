import { makePropDecorator } from '@gradii/annotation'
import { MorphMany } from '../../fedaco/relations/morph-many'
import { resolveForwardRef } from '../../query-builder/forward-ref'
import { _additionalProcessingGetter } from '../additional-processing'
import { FedacoRelationColumn } from '../relation-column'
export const MorphManyColumn = makePropDecorator(
  'Fedaco:MorphMany',
  (p) =>
    Object.assign(
      {
        isRelation: true,
        type: 'MorphMany',
        _getRelation: function (m, relation) {
          const instance = m._newRelatedInstance(resolveForwardRef(p.related))
          const [type, id] = m._getMorphs(p.morphName, p.type, p.id)
          const table = instance.getTable()
          const localKey = p.localKey || m.getKeyName()
          const r = new MorphMany(
            instance.newQuery(),
            m,
            `${table}.${type}`,
            `${table}.${id}`,
            localKey
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
