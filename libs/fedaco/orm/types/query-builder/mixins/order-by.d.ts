/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { QueryBuilder } from '../../query-builder/query-builder';
import { RawExpression } from '../../query/ast/expression/raw-expression';
export interface QueryBuilderOrderBy {
    latest(column: string): this;
    oldest(column: string): this;
    orderBy(column: ((...args: any[]) => any) | QueryBuilder | RawExpression | string, direction?: string): this;
    orderByDesc(column: (q: QueryBuilder) => void): this;
    orderByDesc(column: string): this;
    orderByRaw(sql: string, bindings: any[] | any): this;
    reorder(column?: ((...args: any[]) => any) | QueryBuilder | RawExpression | string, direction?: string): this;
}
export declare type QueryBuilderOrderByCtor = Constructor<QueryBuilderOrderBy>;
export declare function mixinOrderBy<T extends Constructor<any>>(base: T): QueryBuilderOrderByCtor & T;
