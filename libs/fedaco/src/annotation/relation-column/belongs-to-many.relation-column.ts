/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import { isBlank } from '@gradii/nanofn';
import type { Model } from '../../fedaco/model';
import { BelongsToMany } from '../../fedaco/relations/belongs-to-many';
import type { Relation } from '../../fedaco/relations/relation';
import type { ForwardRefFn} from '../../query-builder/forward-ref';
import { resolveForwardRef } from '../../query-builder/forward-ref';
import { _additionalProcessingGetter } from '../additional-processing';
import type { FedacoDecorator } from '../annotation.interface';
import { RelationType } from '../enum-relation';
import type { RelationColumnAnnotation } from '../relation-column';
import { FedacoRelationColumn } from '../relation-column';


export interface BelongsToManyRelationAnnotation<T extends Relation = BelongsToMany> extends RelationColumnAnnotation<T> {
  related: typeof Model | ForwardRefFn<typeof Model>;
  table?: string;
  foreignPivotKey?: string;
  relatedPivotKey?: string;
  parentKey?: string;
  relatedKey?: string;
  relation?: string;
}

export const BelongsToManyColumn: FedacoDecorator<BelongsToManyRelationAnnotation> = makePropDecorator(
  'Fedaco:BelongsToMany',
  (p: BelongsToManyRelationAnnotation) => ({
    isRelation  : true,
    type        : RelationType.BelongsToMany,
    _getRelation: function (m: Model, relation: string) {
      if (!isBlank(p.relation)) {
        relation = p.relation;
      }
      const resolvedRelatedClazz = resolveForwardRef(p.related);
      const instance          = m._newRelatedInstance(resolvedRelatedClazz);
      const foreignPivotKey = p.foreignPivotKey || m.GetForeignKey();
      const relatedPivotKey = p.relatedPivotKey || instance.GetForeignKey();
      let table             = p.table;
      if (isBlank(table)) {
        table = m.JoiningTable(resolvedRelatedClazz, instance);
      }
      const r = new BelongsToMany(
        instance.NewQuery(), m, table, foreignPivotKey,
        relatedPivotKey, p.parentKey || m.GetKeyName(),
        p.relatedKey || instance.GetKeyName(),
        relation);

      if (p.onQuery) {
        p.onQuery(r);
      }
      return r;
    },
    ...p
  }),
  FedacoRelationColumn,
  (target: any, name: string, decorator) => {
    _additionalProcessingGetter(target, name, decorator);
  }
);

