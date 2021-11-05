/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoDecorator } from '../annotation.interface';
import { ColumnAnnotation } from '../column';
export interface PrimaryColumnAnnotation extends ColumnAnnotation {
    keyType: string;
}
export declare const PrimaryColumn: FedacoDecorator<PrimaryColumnAnnotation>;
