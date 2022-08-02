/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import type { Model } from '../../fedaco/model';
import { HasOneThrough } from '../../fedaco/relations/has-one-through';
import type { ForwardRefFn} from '../../query-builder/forward-ref';
import { resolveForwardRef } from '../../query-builder/forward-ref';
import { _additionalProcessingGetter } from '../additional-processing';
import type { FedacoDecorator } from '../annotation.interface';
import { RelationType } from '../enum-relation';
import type { RelationColumnAnnotation } from '../relation-column';
import { FedacoRelationColumn } from '../relation-column';


export interface HasOneThroughRelationAnnotation extends RelationColumnAnnotation {
  related: typeof Model | ForwardRefFn;
  through: typeof Model | ForwardRefFn;
  firstKey?: string;
  secondKey?: string;
  localKey?: string;
  secondLocalKey?: string;
}

export const HasOneThroughColumn: FedacoDecorator<HasOneThroughRelationAnnotation> = makePropDecorator(
  'Fedaco:HasOneThrough',
  (p: HasOneThroughRelationAnnotation) => ({
    isRelation  : true,
    type        : RelationType.HasOneThrough,
    _getRelation: function (m: Model, relation: string) {
      // @ts-ignore
      const throughClazz = resolveForwardRef(p.through);
      const through      = new throughClazz();
      const firstKey     = p.firstKey || m.getForeignKey();
      const secondKey    = p.secondKey || through.getForeignKey();
      const clazz        = resolveForwardRef(p.related);

      const r = new HasOneThrough(
        m._newRelatedInstance(clazz).newQuery(),
        m, through, firstKey, secondKey,
        p.localKey || m.getKeyName(), p.secondLocalKey || through.getKeyName()
      );

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

