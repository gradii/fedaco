import { makePropDecorator } from '@gradii/annotation'
import { isBlank } from '@gradii/check-type'
import { BelongsTo } from '../../fedaco/relations/belongs-to'
import { snakeCase } from '../../helper/str'
import { resolveForwardRef } from '../../query-builder/forward-ref'
import { _additionalProcessingGetter } from '../additional-processing'
import { FedacoRelationColumn } from '../relation-column'

export const BelongsToColumn = makePropDecorator(
  'Fedaco:BelongsToColumn',
  (p) =>
    Object.assign(
      {
        isRelation: true,
        type: 'BelongsTo',
        _getRelation: function (m, relation) {
          if (isBlank(p.relation)) {
            p.relation = relation
          }
          const instance = m._newRelatedInstance(resolveForwardRef(p.related))
          p.foreignKey =
            p.foreignKey || `${snakeCase(p.relation)}_${instance.getKeyName()}`
          p.ownerKey = p.ownerKey || instance.getKeyName()
          const r = new BelongsTo(
            instance.newQuery(),
            m,
            p.foreignKey,
            p.ownerKey,
            p.relation
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
