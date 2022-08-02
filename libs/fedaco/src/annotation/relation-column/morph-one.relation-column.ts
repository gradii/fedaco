/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import type { Model } from '../../fedaco/model';
import { MorphOne } from '../../fedaco/relations/morph-one';
import type { ForwardRefFn} from '../../query-builder/forward-ref';
import { resolveForwardRef } from '../../query-builder/forward-ref';
import { _additionalProcessingGetter } from '../additional-processing';
import type { FedacoDecorator } from '../annotation.interface';
import { RelationType } from '../enum-relation';
import type { RelationColumnAnnotation } from '../relation-column';
import { FedacoRelationColumn } from '../relation-column';

export interface MorphOneRelationAnnotation extends RelationColumnAnnotation<MorphOne> {
  related?: typeof Model | ForwardRefFn;
  morphName: string;
  type?: string;
  id?: string;
  localKey?: string;
}

export const MorphOneColumn: FedacoDecorator<MorphOneRelationAnnotation> = makePropDecorator(
  'Fedaco:MorphOneColumn',
  (p: MorphOneRelationAnnotation) => ({
    isRelation  : true,
    type        : RelationType.MorphOne,
    _getRelation: function (m: Model, relation: string) {
      const instance = m._newRelatedInstance(resolveForwardRef(p.related));

      const [type, id] = m._getMorphs(p.morphName, p.type, p.id);
      const localKey   = p.localKey || m.getKeyName();
      const r          = new MorphOne(
        instance.newQuery(), m,
        `${instance.getTable()}.${type}`,
        `${instance.getTable()}.${id}`,
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

