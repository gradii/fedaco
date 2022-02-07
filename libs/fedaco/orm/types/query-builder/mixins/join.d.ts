/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { QueryBuilder } from '../../query-builder/query-builder';
import { TableReferenceExpression } from '../../query/ast/table-reference-expression';
export interface QueryBuilderJoin {
    join(table: string | TableReferenceExpression, first: string | ((...args: any[]) => any), operator: string, second: any, type?: string, where?: any): this;
    join(table: string, first: string | ((...args: any[]) => any), second: any): this;
    join(table: string, on: (q: QueryBuilder) => QueryBuilder | void): this;
    join(tableOrJoinSql: string): this;
    joinWhere(table: string, first: Function | string, operator: string, second: string, type?: string): this;
    joinSub(query: Function | QueryBuilder | string, as: string, first: Function | string, operator?: string, second?: string | number, type?: string, where?: boolean): this;
    leftJoin(table: string, first: Function | string, operator?: string, second?: string): this;
    leftJoinWhere(table: string, first: Function | string, operator: string, second: string): this;
    leftJoinSub(query: Function | QueryBuilder | string, as: string, first: Function | string, operator?: string, second?: string): this;
    rightJoin(table: string, first: Function | string, operator?: string, second?: string): this;
    rightJoinWhere(table: string, first: Function | string, operator: string, second: string): this;
    rightJoinSub(query: Function | QueryBuilder | string, as: string, first: Function | string, operator?: string, second?: string): this;
    crossJoin(table: string, first?: Function | string, operator?: string, second?: string): this;
}
export declare type QueryBuilderJoinCtor = Constructor<QueryBuilderJoin>;
export declare function mixinJoin<T extends Constructor<any>>(base: T): QueryBuilderJoinCtor & T;
