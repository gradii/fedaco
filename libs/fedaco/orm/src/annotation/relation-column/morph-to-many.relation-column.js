import { makePropDecorator } from '@gradii/annotation'
import { MorphToMany } from '../../fedaco/relations/morph-to-many'
import { plural } from '../../helper/pluralize'
import { resolveForwardRef } from '../../query-builder/forward-ref'
import { _additionalProcessingGetter } from '../additional-processing'
import { FedacoRelationColumn } from '../relation-column'
export const MorphToManyColumn = makePropDecorator(
  'Fedaco:MorphToManyColumn',
  (p) =>
    Object.assign(
      {
        isRelation: true,
        type: 'MorphToMany',
        _getRelation: function (m, relation) {
          const caller = relation
          const instance = m._newRelatedInstance(resolveForwardRef(p.related))
          const foreignPivotKey = p.foreignPivotKey || p.name + '_id'
          const relatedPivotKey = p.relatedPivotKey || instance.getForeignKey()
          let table = p.table
          if (!table) {
            const words = p.name.split('_')
            words[words.length - 1] = plural(words[words.length - 1])
            table = words.join('_')
          }
          const r = new MorphToMany(
            instance.newQuery(),
            m,
            p.name,
            table,
            foreignPivotKey,
            relatedPivotKey,
            p.parentKey || m.getKeyName(),
            p.relatedKey || instance.getKeyName(),
            caller,
            p.inverse
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
