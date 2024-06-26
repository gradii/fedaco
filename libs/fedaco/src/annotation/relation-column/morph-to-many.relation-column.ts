/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import type { Model } from '../../fedaco/model';
import { MorphToMany } from '../../fedaco/relations/morph-to-many';
import { plural } from '@gradii/nanofn';
import type { ForwardRefFn} from '../../query-builder/forward-ref';
import { resolveForwardRef } from '../../query-builder/forward-ref';
import { _additionalProcessingGetter } from '../additional-processing';
import type { FedacoDecorator } from '../annotation.interface';
import { RelationType } from '../enum-relation';
import type { RelationColumnAnnotation } from '../relation-column';
import { FedacoRelationColumn } from '../relation-column';

export interface MorphToManyRelationAnnotation extends RelationColumnAnnotation {
  related: typeof Model | ForwardRefFn<typeof Model>;
  name: string;
  table?: string;
  foreignPivotKey?: string;
  relatedPivotKey?: string;
  parentKey?: string;
  relatedKey?: string;
  inverse?: boolean;
}

export const MorphToManyColumn: FedacoDecorator<MorphToManyRelationAnnotation> = makePropDecorator(
  'Fedaco:MorphToManyColumn',
  (p: MorphToManyRelationAnnotation) => ({
    isRelation  : true,
    type        : RelationType.MorphToMany,
    _getRelation: function (m: Model, relation: string) {

      const caller          = relation;
      const instance        = m._newRelatedInstance(resolveForwardRef(p.related));
      const foreignPivotKey = p.foreignPivotKey || p.name + '_id';
      const relatedPivotKey = p.relatedPivotKey || instance.GetForeignKey();
      let table             = p.table;
      if (!table) {
        const words             = p.name.split('_');
        words[words.length - 1] = plural(words[words.length - 1]);
        table                   = words.join('_');
      }
      const r = new MorphToMany(instance.NewQuery(), m, p.name, table, foreignPivotKey,
        relatedPivotKey, p.parentKey || m.GetKeyName(), p.relatedKey || instance.GetKeyName(),
        caller, p.inverse);

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
