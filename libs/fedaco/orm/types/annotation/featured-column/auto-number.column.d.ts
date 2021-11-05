/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoDecorator } from '../annotation.interface';
import { ColumnAnnotation } from '../column';
export interface AutoNumberColumnAnnotation extends ColumnAnnotation {
}
export declare const AutoNumberColumn: FedacoDecorator<AutoNumberColumnAnnotation>;
