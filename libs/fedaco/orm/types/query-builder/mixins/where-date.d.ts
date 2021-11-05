/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { QueryBuilder } from '../../query-builder/query-builder';
import { RawExpression } from '../../query/ast/expression/raw-expression';
export interface QueryBuilderWhereDate {
    /**
     *  Add a date based (year, month, day, time) statement to the query.
     */
    _addDateBasedWhere(this: QueryBuilder, type: string, column: string, operator: string, value: any, conjunction: string): this;
    orWhereDate(column: string, value?: RawExpression | Date | string | number): this;
    orWhereDate(column: string, operator: string, value: RawExpression | Date | string | number, conjunction?: 'and' | 'or'): this;
    orWhereDay(column: string, value?: RawExpression | Date | string | number): this;
    orWhereDay(column: string, operator: string, value: RawExpression | Date | string | number, conjunction?: 'and' | 'or'): this;
    orWhereMonth(column: string, value?: RawExpression | Date | string | number): QueryBuilder;
    orWhereMonth(column: string, operator: string, value: RawExpression | Date | string | number, conjunction?: 'and' | 'or'): this;
    orWhereTime(column: string, value?: RawExpression | Date | string | number): this;
    orWhereTime(column: string, operator: string, value: RawExpression | Date | string | number, conjunction?: 'and' | 'or'): this;
    orWhereYear(column: string, value?: RawExpression | Date | string | number): this;
    orWhereYear(column: string, operator: string, value: RawExpression | Date | string | number, conjunction?: 'and' | 'or'): this;
    whereDate(column: string, value?: RawExpression | Date | string | number): this;
    whereDate(column: string, operator: string, value: RawExpression | Date | string | number, conjunction?: 'and' | 'or'): QueryBuilder;
    whereDay(column: string, value?: RawExpression | Date | string | number): this;
    whereDay(column: string, operator: string, value?: RawExpression | Date | string | number, conjunction?: 'and' | 'or'): this;
    whereMonth(column: string, value?: RawExpression | Date | string | number): this;
    whereMonth(column: string, operator: string, value?: RawExpression | Date | string | number, conjunction?: 'and' | 'or'): this;
    whereTime(column: string, value?: RawExpression | Date | string | number): this;
    whereTime(column: string, operator: string, value?: RawExpression | Date | string | number, conjunction?: 'and' | 'or'): this;
    whereYear(column: string, value?: RawExpression | Date | string | number): this;
    whereYear(column: string, operator: string, value?: RawExpression | Date | string | number, conjunction?: 'and' | 'or'): this;
}
export declare type WhereDateCtor = Constructor<QueryBuilderWhereDate>;
export declare function mixinWhereDate<T extends Constructor<any>>(base: T): WhereDateCtor & T;
