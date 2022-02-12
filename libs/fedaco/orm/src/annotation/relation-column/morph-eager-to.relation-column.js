import { makePropDecorator } from '@gradii/annotation'
import { MorphTo } from '../../fedaco/relations/morph-to'
import { _additionalProcessingGetter } from '../additional-processing'
import { FedacoRelationColumn } from '../relation-column'

function morphEagerTo(m, name, type, id, ownerKey) {
  return new MorphTo(
    m.newQuery().setEagerLoads([]),
    m,
    id,
    ownerKey,
    type,
    name
  )
}

function morphInstanceTo(m, target, name, type, id, ownerKey) {
  const instance = m.newRelatedInstance(target)
  return new MorphTo(
    instance.newQuery(),
    m,
    id,
    ownerKey !== null && ownerKey !== void 0 ? ownerKey : instance.getKeyName(),
    type,
    name
  )
}
export const MorphEagerToColumn = makePropDecorator(
  'Fedaco:MorphToColumn',
  (p) =>
    Object.assign(
      {
        isRelation: true,
        type: 'MorphTo',
        _getRelation: function (m, relation) {
          const name = p.name || relation
          const r = new MorphTo(
            m.newQuery().setEagerLoads([]),
            m,
            p.id,
            p.ownerKey,
            p.type,
            name
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
