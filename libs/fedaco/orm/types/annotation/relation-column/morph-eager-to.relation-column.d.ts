/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Model } from '../../fedaco/model';
import { FedacoDecorator } from '../annotation.interface';
import { RelationColumnAnnotation } from '../relation-column';
export interface MorphEagerToRelationAnnotation
    extends RelationColumnAnnotation {
    name: string;

    morphTypeMap: Record<string, typeof Model>;
    type?: string;
    id?: string;
    ownerKey?: string;
}
export declare const MorphEagerToColumn: FedacoDecorator<MorphEagerToRelationAnnotation>;
