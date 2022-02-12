/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { makePropDecorator } from '@gradii/annotation'
import { HasMany } from '../../fedaco/relations/has-many'
import { resolveForwardRef } from '../../query-builder/forward-ref'
import { _additionalProcessingGetter } from '../additional-processing'
import { FedacoRelationColumn } from '../relation-column'
export const HasManyColumn = makePropDecorator(
  'Fedaco:HasManyColumn',
  (p) =>
    Object.assign(
      {
        isRelation: true,
        type: 'HasMany',
        _getRelation: function (m) {
          const instance = m._newRelatedInstance(resolveForwardRef(p.related))
          const foreignKey = p.foreignKey || m.getForeignKey()
          const localKey = p.localKey || m.getKeyName()
          const r = new HasMany(
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
