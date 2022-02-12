/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { RawExpression } from '../../query/ast/expression/raw-expression';
export interface QueryBuilderGroupBy {
    groupBy(groups: string[]): this;
    groupBy(groups: RawExpression): this;
    groupBy(...args: string[]): this;
    groupByRaw(sql: string | RawExpression, bindings: any[]): this;
}
export declare type QueryBuilderGroupByCtor = Constructor<QueryBuilderGroupBy>;
export declare function mixinGroupBy<T extends Constructor<any>>(
    base: T
): QueryBuilderGroupByCtor & T;
