/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makePropDecorator } from '@gradii/annotation';
import { isBlank, snakeCase } from '@gradii/nanofn';
import type { Model } from '../../fedaco/model';
import { MorphTo } from '../../fedaco/relations/morph-to';
import { Relation } from '../../fedaco/relations/relation';
import type { ForwardRefFn } from '../../query-builder/forward-ref';
import { resolveForwardRef } from '../../query-builder/forward-ref';
import { _additionalProcessingGetter } from '../additional-processing';
import type { FedacoDecorator } from '../annotation.interface';
import { RelationType } from '../enum-relation';
import type { RelationColumnAnnotation } from '../relation-column';
import { FedacoRelationColumn } from '../relation-column';

/* Define a polymorphic, inverse one-to-one or many relationship. */
function morphEagerTo(m: Model, name: string, type: string, id: string, ownerKey: string) {
  return new MorphTo(m.NewQuery().setEagerLoads([]), m, id, ownerKey, type, name);
}

/* Define a polymorphic, inverse one-to-one or many relationship. */
function morphInstanceTo(m: Model, target: typeof Model, name: string, type: string, id: string, ownerKey: string) {
  const instance = m._newRelatedInstance(target);
  return new MorphTo(instance.NewQuery(), m, id, ownerKey ?? instance.GetKeyName(), type, name);
}

export interface MorphToRelationAnnotation extends RelationColumnAnnotation {
  /**
   * the type of class to use morph to
   */
  morphTypeMap: Record<string, typeof Model | ForwardRefFn<typeof Model>>;
  type?: string;
  id?: string;
  ownerKey?: string;

  foreignKey: string;
}

export const MorphToColumn: FedacoDecorator<Omit<MorphToRelationAnnotation, 'foreignKey'>> = makePropDecorator(
  'Fedaco:MorphToColumn',
  (p: MorphToRelationAnnotation) => ({
    isRelation  : true,
    type        : RelationType.MorphTo,
    _getRelation: function (m: Model, relation: string) {
      // If no name is provided, we will use the backtrace to get the function name
      // since that is most likely the name of the polymorphic interface. We can
      // use that to get both the class and foreign key that will be utilized.
      const name = p.name || relation;
      const [type, id] = m._getMorphs(snakeCase(name), p.type, p.id);

      // If the type value is null it is probably safe to assume we're eager loading
      // the relationship. In this case we'll just pass in a dummy query where we
      // need to remove any eager loads that may already be defined on a model.
      const morphType = m._getAttributeFromArray(type);
      const clazz = resolveForwardRef(p.morphTypeMap[morphType] || Relation._morphMap[morphType]);
      const r = isBlank(clazz)
        ? morphEagerTo(m, name, type, id, p.ownerKey)
        : morphInstanceTo(m, clazz, name, type, id, p.ownerKey);

      if (p.onQuery) {
        p.onQuery(r);
      }
      return r;
    },
    ...p,
  }),
  FedacoRelationColumn,
  (target: any, name: string, decorator) => {
    _additionalProcessingGetter(target, name, decorator);
  },
);
