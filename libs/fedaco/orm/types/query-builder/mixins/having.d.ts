/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { SqlNode } from '../../query/sql-node';
export interface QueryBuilderHaving {
    addHaving(where: SqlNode, conjunction: string): this;
    having(
        column: string,
        value?: string | number | boolean | RawExpression
    ): this;
    having(
        column: string,
        operator?: string,
        value?: string | number | boolean | RawExpression,
        conjunction?: string
    ): this;
    havingBetween(
        column: string,
        values: any[],
        conjunction?: string,
        not?: boolean
    ): this;
    havingRaw(sql: string): this;
    havingRaw(sql: string, bindings: any[], conjunction?: string): this;
    orHaving(
        column: string,
        value?: string | number | boolean | RawExpression
    ): this;
    orHaving(
        column: string,
        operator?: string,
        value?: string | number | boolean | RawExpression
    ): this;
    orHavingRaw(sql: string): this;
    orHavingRaw(sql: string, bindings: any[]): this;
    orHavingRaw(sql: string, bindings: any[]): this;
}
export declare type QueryBuilderHavingCtor = Constructor<QueryBuilderHaving>;
export declare function mixinHaving<T extends Constructor<any>>(
    base: T
): QueryBuilderHavingCtor & T;
