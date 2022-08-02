/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import type { Model } from '../../fedaco/model';
import { HasMany } from '../../fedaco/relations/has-many';
import type { ForwardRefFn} from '../../query-builder/forward-ref';
import { resolveForwardRef } from '../../query-builder/forward-ref';
import { _additionalProcessingGetter } from '../additional-processing';
import type { FedacoDecorator } from '../annotation.interface';
import { RelationType } from '../enum-relation';
import type { RelationColumnAnnotation } from '../relation-column';
import { FedacoRelationColumn } from '../relation-column';

export interface HasManyRelationAnnotation extends RelationColumnAnnotation {
  related: typeof Model | ForwardRefFn;
  foreignKey?: string;
  localKey?: string;
}

export const HasManyColumn: FedacoDecorator<HasManyRelationAnnotation> = makePropDecorator(
  'Fedaco:HasManyColumn',
  (p: HasManyRelationAnnotation) => ({
    isRelation  : true,
    type        : RelationType.HasMany,
    _getRelation: function (m: Model) {
      const instance   = m._newRelatedInstance(resolveForwardRef(p.related));
      const foreignKey = p.foreignKey || m.getForeignKey();
      const localKey   = p.localKey || m.getKeyName();
      const r          = new HasMany(
        instance.newQuery(),
        m,
        `${instance.getTable()}.${foreignKey}`,
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

