/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Model } from '../../fedaco/model';
import { ForwardRefFn } from '../../query-builder/forward-ref';
import { FedacoDecorator } from '../annotation.interface';
import { RelationColumnAnnotation } from '../relation-column';
export interface HasOneThroughRelationAnnotation extends RelationColumnAnnotation {
    related: typeof Model | ForwardRefFn;
    through: typeof Model | ForwardRefFn;
    firstKey?: string;
    secondKey?: string;
    localKey?: string;
    secondLocalKey?: string;
}
export declare const HasOneThroughColumn: FedacoDecorator<HasOneThroughRelationAnnotation>;
