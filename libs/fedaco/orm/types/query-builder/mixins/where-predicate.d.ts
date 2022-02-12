/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import type { FedacoBuilder } from '../../fedaco/fedaco-builder';
import { Constructor } from '../../helper/constructor';
import { QueryBuilder } from '../query-builder';
export interface QueryBuilderWherePredicate {
    addWhereExistsQuery(
        query: QueryBuilder,
        conjunction?: string,
        not?: boolean
    ): void;
    orWhereBetween(column: string, values: any[], not?: boolean): this;
    orWhereExists(callback: (q: QueryBuilder) => void, not?: boolean): void;
    orWhereIn(column: string, q: (q: this) => void): this;
    orWhereIn(column: string, q: (q: QueryBuilder) => void): this;
    orWhereIn(column: string, q: QueryBuilder): this;
    orWhereIn(column: string, values: any[], not?: string): this;
    orWhereIntegerInRaw(column: string, values: any[]): this;
    orWhereIntegerNotInRaw(column: string, values: any[]): this;
    orWhereNotBetween(column: string, values: any[]): this;
    orWhereNotExists(callback: (q: QueryBuilder) => void): void;
    orWhereNotIn(column: string, q: (q: this) => void): this;
    orWhereNotIn(column: string, values: any[]): this;
    orWhereNotNull(column: string | string[]): this;
    orWhereNull(column: string | string[]): this;
    whereBetween(
        column: string,
        values: any[],
        conjunction?: string,
        not?: boolean
    ): this;
    whereExists(
        callback: (q: QueryBuilder) => void,
        conjunction?: string,
        not?: boolean
    ): void;
    whereIn(column: string, q: (q: this) => void): this;
    whereIn(column: string, q: QueryBuilder): this;
    whereIn(column: string, q: FedacoBuilder): this;
    whereIn(
        column: string,
        values: any[],
        conjunction?: string,
        not?: boolean
    ): this;
    whereIntegerInRaw(
        column: string,
        values: any[],
        conjunction?: string,
        not?: boolean
    ): this;
    whereIntegerNotInRaw(
        column: string,
        values: any[],
        conjunction?: string
    ): this;
    whereNotBetween(column: string, values: any[], conjunction?: string): this;
    whereNotExists(callback: Function, conjunction?: string): void;
    whereNotIn(column: string, q: (q: this) => void): this;
    whereNotIn(column: string, values: any[], conjunction?: string): this;
    whereNotNull(columns: string | any[], conjunction?: string): this;
    whereNull(
        columns: string | any[],
        conjunction?: string,
        not?: boolean
    ): this;
    whereNull(column: string): this;
}
export declare type WherePredicateCtor =
    Constructor<QueryBuilderWherePredicate>;
export declare function mixinWherePredicate<T extends Constructor<any>>(
    base: T
): WherePredicateCtor & T;
