/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoDecorator } from '../annotation.interface';
import { ColumnAnnotation } from '../column';
export interface BinaryColumnAnnotation extends ColumnAnnotation {
    length?: number;
    isEncrypted?: boolean;
}
export declare const BinaryColumn: FedacoDecorator<BinaryColumnAnnotation>;
