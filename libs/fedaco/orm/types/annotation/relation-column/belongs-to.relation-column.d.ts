/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Model } from '../../fedaco/model';
import { ForwardRefFn } from '../../query-builder/forward-ref';
import { FedacoDecorator } from '../annotation.interface';
import { RelationColumnAnnotation } from '../relation-column';
export interface BelongsToRelationAnnotation extends RelationColumnAnnotation {
    related: typeof Model | ForwardRefFn;
    foreignKey?: string;
    ownerKey?: string;
    relation?: string;
}
/**
 * todo if foreign key is not defined in model. should mark foreign key as attribute can be accessed
 */
export declare const BelongsToColumn: FedacoDecorator<BelongsToRelationAnnotation>;
