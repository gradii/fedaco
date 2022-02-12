/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { makePropDecorator } from '@gradii/annotation'
import { isBlank } from '@gradii/check-type'
import { MorphTo } from '../../fedaco/relations/morph-to'
import { Relation } from '../../fedaco/relations/relation'
import { snakeCase } from '../../helper/str'
import { resolveForwardRef } from '../../query-builder/forward-ref'
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
  const instance = m._newRelatedInstance(target)
  return new MorphTo(
    instance.newQuery(),
    m,
    id,
    ownerKey !== null && ownerKey !== void 0 ? ownerKey : instance.getKeyName(),
    type,
    name
  )
}
export const MorphToColumn = makePropDecorator(
  'Fedaco:MorphToColumn',
  (p) =>
    Object.assign(
      {
        isRelation: true,
        type: 'MorphTo',
        _getRelation: function (m, relation) {
          const name = p.name || relation
          const [type, id] = m._getMorphs(snakeCase(name), p.type, p.id)

          const morphType = m._getAttributeFromArray(type)
          const clazz = resolveForwardRef(
            p.morphTypeMap[morphType] || Relation._morphMap[morphType]
          )
          const r = isBlank(clazz)
            ? morphEagerTo(m, name, type, id, p.ownerKey)
            : morphInstanceTo(m, clazz, name, type, id, p.ownerKey)
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
