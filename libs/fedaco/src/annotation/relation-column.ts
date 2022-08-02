/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Model } from '../fedaco/model';
import type { Relation } from '../fedaco/relations/relation';
import type { ColumnAnnotation } from './column';
import type { RelationType } from './enum-relation';

export interface RelationColumnAnnotation<T extends Relation = Relation> extends ColumnAnnotation {
  name?: string;
  isRelation?: boolean;
  relationType?: RelationType;

  onQuery?: (q: T | Relation | any) => void;
  _getRelation?: (m: Model, relation: string) => any;
}

export class FedacoRelationColumn {
  static isTypeOf(obj: any) {
    return obj instanceof FedacoRelationColumn;
  }
}
