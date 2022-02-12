/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { makePropDecorator } from '@gradii/annotation'
import { MorphOne } from '../../fedaco/relations/morph-one'
import { resolveForwardRef } from '../../query-builder/forward-ref'
import { _additionalProcessingGetter } from '../additional-processing'
import { FedacoRelationColumn } from '../relation-column'
export const MorphOneColumn = makePropDecorator(
  'Fedaco:MorphOneColumn',
  (p) =>
    Object.assign(
      {
        isRelation: true,
        type: 'MorphOne',
        _getRelation: function (m, relation) {
          const instance = m._newRelatedInstance(resolveForwardRef(p.related))
          const [type, id] = m._getMorphs(p.morphName, p.type, p.id)
          const localKey = p.localKey || m.getKeyName()
          const r = new MorphOne(
            instance.newQuery(),
            m,
            `${instance.getTable()}.${type}`,
            `${instance.getTable()}.${id}`,
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
