/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
export interface QueryBuilderLimitOffset {
    limit(value: number): this;
    skip(value: number): this;
    offset(value: number): this;
    take(value: number): this;
    forPage(pageNo: number, pageSize: number): this;
    forPageBeforeId(perPage?: number, lastId?: number, column?: string): this;
    forPageAfterId(perPage?: number, lastId?: number, column?: string): this;
}
export declare type QueryBuilderLimitOffsetCtor = Constructor<QueryBuilderLimitOffset>;
export declare function mixinLimitOffset<T extends Constructor<any>>(base: T): QueryBuilderLimitOffsetCtor & T;
