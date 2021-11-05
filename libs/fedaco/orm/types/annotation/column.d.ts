/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoAnnotation } from './annotation.interface';
export interface ColumnAnnotation extends FedacoAnnotation {
    field?: string;
    unique?: boolean;
    hidden?: boolean;
}
export declare class FedacoColumn {
    static isTypeOf(obj: any): boolean;
}
