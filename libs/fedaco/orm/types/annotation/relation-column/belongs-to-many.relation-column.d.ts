/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Model } from '../../fedaco/model';
import { BelongsToMany } from '../../fedaco/relations/belongs-to-many';
import { Relation } from '../../fedaco/relations/relation';
import { ForwardRefFn } from '../../query-builder/forward-ref';
import { FedacoDecorator } from '../annotation.interface';
import { RelationColumnAnnotation } from '../relation-column';
export interface BelongsToManyRelationAnnotation<T extends Relation = BelongsToMany> extends RelationColumnAnnotation<T> {
    related: typeof Model | ForwardRefFn<typeof Model>;
    table?: string;
    foreignPivotKey?: string;
    relatedPivotKey?: string;
    parentKey?: string;
    relatedKey?: string;
    relation?: string;
}
export declare const BelongsToManyColumn: FedacoDecorator<BelongsToManyRelationAnnotation>;
