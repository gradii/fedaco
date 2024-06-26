/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import type { Model } from '../../fedaco/model';
import { HasOne } from '../../fedaco/relations/has-one';
import type { ForwardRefFn} from '../../query-builder/forward-ref';
import { resolveForwardRef } from '../../query-builder/forward-ref';
import { _additionalProcessingGetter } from '../additional-processing';
import type { FedacoDecorator } from '../annotation.interface';
import { ColumnAnnotation } from '../column';
import { RelationType } from '../enum-relation';
import type { RelationColumnAnnotation } from '../relation-column';
import { FedacoRelationColumn } from '../relation-column';

export interface HasOneRelationAnnotation extends RelationColumnAnnotation<HasOne> {
  related?: typeof Model | ForwardRefFn;
  foreignKey?: string;
  localKey?: string;
}

export const HasOneColumn: FedacoDecorator<HasOneRelationAnnotation> = makePropDecorator(
  'Fedaco:HasOneColumn',
  (p: HasOneRelationAnnotation) => ({
    isRelation  : true,
    type        : RelationType.HasOne,
    _getRelation: function (m: Model, relation: string) {
      const instance     = m._newRelatedInstance(resolveForwardRef(p.related));
      const foreignKey = p.foreignKey || m.GetForeignKey();
      const localKey   = p.localKey || m.GetKeyName();
      const r          = new HasOne(
        instance.NewQuery(),
        m,
        `${instance.GetTable()}.${foreignKey}`,
        localKey);

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

