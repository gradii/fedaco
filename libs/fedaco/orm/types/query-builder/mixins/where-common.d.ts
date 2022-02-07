/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { QueryBuilder } from '../../query-builder/query-builder';
import { Expression } from '../../query/ast/expression/expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { SqlNode } from '../../query/sql-node';
export interface QueryBuilderWhereCommon {
    /**
     * Add another query builder as a nested where to the query builder.
     */
    addNestedWhereQuery(query: QueryBuilder, conjunction: 'and' | 'or' | string): this;
    addWhere(where: SqlNode, conjunction?: 'and' | 'or' | 'andX' | 'orX'): this;
    /**
     * Create a new query instance for nested where condition.
     */
    forNestedWhere(): this;
    orWhere(where: (q: QueryBuilder) => void): this;
    orWhere(column: Function | string | any[], value: any): this;
    orWhere(column: Function | string | any[], operator: any, value: any): this;
    orWhere(column: Function | string | any[], operator: any, value: (q: QueryBuilder) => void): this;
    orWhereColumn(first: string | any[], second?: string): this;
    orWhereColumn(first: string | any[], operator?: string, second?: string): this;
    orWhereRaw(sql: string, bindings: any[]): this;
    where(where: any[][]): this;
    where(where: {
        [key: string]: any;
    }): this;
    where(where: (q: QueryBuilder) => void): this;
    where(left: string, right: Function | RawExpression | boolean | string | number | Array<string | number>): this;
    where(left: string, operator: string, right: Function | RawExpression | boolean | string | number | Array<string | number>): this;
    where(left: string, operator: string, right: Function | RawExpression | boolean | string | number | Array<string | number>, conjunction: 'and' | 'or' | string): this;
    where(left: Function | string | any[], operator: string, right: Function | RawExpression | boolean | string | number | Array<string | number>, conjunction: 'and' | 'or' | string): this;
    whereColumn(first: any[], conjunction?: string): this;
    whereColumn(first: string | Expression, second?: string | number | boolean, conjunction?: string): this;
    whereColumn(first: string | any[], operator?: string, second?: string, conjunction?: string): this;
    whereNested(callback: (query?: QueryBuilder) => void, conjunction?: 'and' | 'or' | string): this;
    whereRaw(sql: string, bindings: any[], conjunction?: 'and' | 'or'): this;
}
export declare type WhereCommonCtor = Constructor<QueryBuilderWhereCommon>;
export declare function mixinWhereCommon<T extends Constructor<any>>(base: T): WhereCommonCtor & T;
