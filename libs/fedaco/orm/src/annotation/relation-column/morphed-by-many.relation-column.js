import { makePropDecorator } from '@gradii/annotation'
import { MorphToMany } from '../../fedaco/relations/morph-to-many'
import { plural } from '../../helper/pluralize'
import { resolveForwardRef } from '../../query-builder/forward-ref'
import { _additionalProcessingGetter } from '../additional-processing'
import { FedacoRelationColumn } from '../relation-column'
export const MorphedByManyColumn = makePropDecorator(
  'Fedaco:MorphedByMany',
  (p) =>
    Object.assign(
      {
        isRelation: true,
        type: 'MorphedByMany',
        _getRelation: function (m, relation) {
          p.foreignPivotKey = p.foreignPivotKey || m.getForeignKey()
          p.relatedPivotKey = p.relatedPivotKey || p.name + '_id'
          const instance = m._newRelatedInstance(resolveForwardRef(p.related))
          p.parentKey = p.parentKey || m.getKeyName()
          p.relatedKey = p.relatedKey || instance.getKeyName()
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
            p.table,
            p.foreignPivotKey,
            p.relatedPivotKey,
            p.parentKey,
            p.relatedKey,
            relation,
            true
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
