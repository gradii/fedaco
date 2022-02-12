/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Model } from '../../fedaco/model';
import { MorphOne } from '../../fedaco/relations/morph-one';
import { ForwardRefFn } from '../../query-builder/forward-ref';
import { FedacoDecorator } from '../annotation.interface';
import { RelationColumnAnnotation } from '../relation-column';
export interface MorphOneRelationAnnotation
    extends RelationColumnAnnotation<MorphOne> {
    related?: typeof Model | ForwardRefFn;
    morphName: string;
    type?: string;
    id?: string;
    localKey?: string;
}
export declare const MorphOneColumn: FedacoDecorator<MorphOneRelationAnnotation>;
