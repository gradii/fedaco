/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Model } from '../../../fedaco/model';
import { HasOne } from '../../../fedaco/relations/has-one';
import { ForwardRefFn } from '../../../query-builder/forward-ref';
import { FedacoDecorator } from '../../annotation.interface';
import { RelationColumnAnnotation } from '../../relation-column';
export interface HasOneOfManyRelationAnnotation extends RelationColumnAnnotation<HasOne> {
    related?: typeof Model | ForwardRefFn;
    foreignKey?: string;
    localKey?: string;
    column?: string | any;
    aggregate?: string | Function;
    relationName?: string;
}
export declare const HasOneOfManyColumn: FedacoDecorator<HasOneOfManyRelationAnnotation>;
