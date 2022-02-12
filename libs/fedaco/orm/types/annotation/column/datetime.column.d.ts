/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoDecorator } from '../annotation.interface';
import { ColumnAnnotation } from '../column';
export interface DatetimeColumnAnnotation extends ColumnAnnotation {}
export declare const DatetimeColumn: FedacoDecorator<DatetimeColumnAnnotation>;
