/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Model } from '../../fedaco/model';
import { ForwardRefFn } from '../../query-builder/forward-ref';
import { FedacoDecorator } from '../annotation.interface';
import { RelationColumnAnnotation } from '../relation-column';
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
export declare const MorphToColumn: FedacoDecorator<Omit<MorphToRelationAnnotation, 'foreignKey'>>;
