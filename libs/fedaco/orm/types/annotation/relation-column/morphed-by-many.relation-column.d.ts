/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Model } from '../../fedaco/model';
import { ForwardRefFn } from '../../query-builder/forward-ref';
import { FedacoDecorator } from '../annotation.interface';
import { RelationColumnAnnotation } from '../relation-column';
export interface MorphedByManyRelationAnnotation extends RelationColumnAnnotation {
    related: typeof Model | ForwardRefFn<typeof Model>;
    name: string;
    table?: string;
    foreignPivotKey?: string;
    relatedPivotKey?: string;
    parentKey?: string;
    relatedKey?: string;
}
export declare const MorphedByManyColumn: FedacoDecorator<MorphedByManyRelationAnnotation>;
