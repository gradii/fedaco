import { makePropDecorator } from '@gradii/annotation'
import { isBlank } from '@gradii/check-type'
import { BelongsToMany } from '../../fedaco/relations/belongs-to-many'
import { resolveForwardRef } from '../../query-builder/forward-ref'
import { _additionalProcessingGetter } from '../additional-processing'
import { FedacoRelationColumn } from '../relation-column'
export const BelongsToManyColumn = makePropDecorator(
  'Fedaco:BelongsToMany',
  (p) =>
    Object.assign(
      {
        isRelation: true,
        type: 'BelongsToMany',
        _getRelation: function (m, relation) {
          if (!isBlank(p.relation)) {
            relation = p.relation
          }
          const resolvedRelatedClazz = resolveForwardRef(p.related)
          const instance = m._newRelatedInstance(resolvedRelatedClazz)
          const foreignPivotKey = p.foreignPivotKey || m.getForeignKey()
          const relatedPivotKey = p.relatedPivotKey || instance.getForeignKey()
          let table = p.table
          if (isBlank(table)) {
            table = m.joiningTable(resolvedRelatedClazz, instance)
          }
          const r = new BelongsToMany(
            instance.newQuery(),
            m,
            table,
            foreignPivotKey,
            relatedPivotKey,
            p.parentKey || m.getKeyName(),
            p.relatedKey || instance.getKeyName(),
            relation
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
