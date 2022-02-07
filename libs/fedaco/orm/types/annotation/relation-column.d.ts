/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Model } from '../fedaco/model';
import { Relation } from '../fedaco/relations/relation';
import { ColumnAnnotation } from './column';
import { RelationType } from './enum-relation';
export interface RelationColumnAnnotation<T extends Relation = Relation> extends ColumnAnnotation {
    name?: string;
    isRelation?: boolean;
    relationType?: RelationType;
    onQuery?: (q: T | Relation | any) => void;
    _getRelation?: (m: Model, relation: string) => any;
}
export declare class FedacoRelationColumn {
    static isTypeOf(obj: any): boolean;
}
