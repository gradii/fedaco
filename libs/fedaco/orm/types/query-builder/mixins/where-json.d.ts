/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
export interface QueryBuilderWhereJson {
    whereJsonContains(
        column: any,
        value: any,
        conjunction?: 'and' | 'or' | string,
        not?: boolean
    ): this;
    orWhereJsonContains(column: any, value: any): this;
    whereJsonDoesntContain(
        column: any,
        value: any,
        conjunction?: 'and' | 'or' | string
    ): this;
    orWhereJsonDoesntContain(column: any, value: any): this;
    whereJsonLength(
        column: any,
        operator: any,
        value?: any,
        conjunction?: 'and' | 'or' | string
    ): this;
    orWhereJsonLength(column: any, operator: any, value?: any): this;
}
export declare type WhereJsonCtor = Constructor<QueryBuilderWhereJson>;
export declare function mixinWhereJson<T extends Constructor<any>>(
    base: T
): WhereJsonCtor & T;
