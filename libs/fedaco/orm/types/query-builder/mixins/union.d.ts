/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { QueryBuilder } from '../../query-builder/query-builder';
export interface QueryBuilderUnion {
    union(query: QueryBuilder | Function, all?: boolean): this;
    unionAll(query: QueryBuilder | Function): this;
}
export declare type QueryBuilderUnionCtor = Constructor<QueryBuilderUnion>;
export declare function mixinUnion<T extends Constructor<any>>(
    base: T
): QueryBuilderUnionCtor & T;
