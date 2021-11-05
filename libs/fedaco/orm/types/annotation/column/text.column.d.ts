/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ColumnAnnotation } from '../column';
export interface TextColumnAnnotation extends ColumnAnnotation {
    isEncrypted?: boolean;
}
export declare const TextColumn: any;
