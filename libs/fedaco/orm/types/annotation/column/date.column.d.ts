/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoDecorator } from '../annotation.interface';
import { ColumnAnnotation } from '../column';
export interface DateColumnAnnotation extends ColumnAnnotation {
}
export declare const DateColumn: FedacoDecorator<DateColumnAnnotation>;
