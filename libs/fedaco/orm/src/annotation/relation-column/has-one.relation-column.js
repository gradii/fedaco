/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { makePropDecorator } from '@gradii/annotation'
import { HasOne } from '../../fedaco/relations/has-one'
import { resolveForwardRef } from '../../query-builder/forward-ref'
import { _additionalProcessingGetter } from '../additional-processing'
import { FedacoRelationColumn } from '../relation-column'
export const HasOneColumn = makePropDecorator(
  'Fedaco:HasOneColumn',
  (p) =>
    Object.assign(
      {
        isRelation: true,
        type: 'HasOne',
        _getRelation: function (m, relation) {
          const instance = m._newRelatedInstance(resolveForwardRef(p.related))
          const foreignKey = p.foreignKey || m.getForeignKey()
          const localKey = p.localKey || m.getKeyName()
          const r = new HasOne(
            instance.newQuery(),
            m,
            `${instance.getTable()}.${foreignKey}`,
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
