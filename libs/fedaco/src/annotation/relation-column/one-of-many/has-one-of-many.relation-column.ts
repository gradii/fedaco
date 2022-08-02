/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import { isString } from '@gradii/check-type';
import type { FedacoBuilder } from '../../../fedaco/fedaco-builder';
import type { Model } from '../../../fedaco/model';
import { HasOne } from '../../../fedaco/relations/has-one';
import type { ForwardRefFn} from '../../../query-builder/forward-ref';
import { resolveForwardRef } from '../../../query-builder/forward-ref';
import { _additionalProcessingGetter } from '../../additional-processing';
import type { FedacoDecorator } from '../../annotation.interface';
import { RelationType } from '../../enum-relation';
import type { RelationColumnAnnotation } from '../../relation-column';
import { FedacoRelationColumn } from '../../relation-column';

export interface HasOneOfManyRelationAnnotation extends RelationColumnAnnotation<HasOne> {
  related?: typeof Model | ForwardRefFn;
  foreignKey?: string;
  localKey?: string;

  column?: string | any;
  aggregate?: string | ((q: FedacoBuilder) => void) | Function;

  relationName?: string;
}

export const HasOneOfManyColumn: FedacoDecorator<HasOneOfManyRelationAnnotation> = makePropDecorator(
  'Fedaco:HasOneOfManyColumn',
  (p: HasOneOfManyRelationAnnotation) => ({
    isRelation  : true,
    type        : RelationType.HasOne,
    _getRelation: function (m: Model, relation: string) {
      // region copied from has one annotation. don't modify it
      const instance   = m._newRelatedInstance(resolveForwardRef(p.related));
      const foreignKey = p.foreignKey || m.getForeignKey();
      const localKey   = p.localKey || m.getKeyName();
      const r          = new HasOne(
        instance.newQuery(),
        m,
        `${instance.getTable()}.${foreignKey}`,
        localKey);
      // endregion

      if (isString(p.aggregate)) {
        relation = p.relationName || `${relation}_${p.aggregate.toLowerCase()}_of_many`;
        if (p.aggregate.toLowerCase() === 'latest') {
          r.latestOfMany(p.column, p.relationName || relation);
        } else if (p.aggregate.toLowerCase() === 'oldest') {
          r.oldestOfMany(p.column, relation);
        } else {
          r.ofMany(p.column, p.aggregate, relation);
        }
      } else {
        r.ofMany(p.column, p.aggregate, p.relationName || relation + '_of_many');
      }

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

