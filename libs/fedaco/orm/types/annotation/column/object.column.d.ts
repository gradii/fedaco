/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoDecorator } from '../annotation.interface';
import { ColumnAnnotation } from '../column';
export interface ObjectColumnAnnotation extends ColumnAnnotation {
    isEncrypted?: boolean;
}
export declare const ObjectColumn: FedacoDecorator<ObjectColumnAnnotation>;
