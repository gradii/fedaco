/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isDate, isNumber, isString } from '@gradii/nanofn';
import { format } from 'date-fns';
import type { Constructor } from '../../helper/constructor';
import type { QueryBuilder } from '../../query-builder/query-builder';
import { BindingVariable } from '../../query/ast/binding-variable';
import {
  ComparisonPredicateExpression
} from '../../query/ast/expression/comparison-predicate-expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { SqlParser } from '../../query/parser/sql-parser';
import { createIdentifier } from '../ast-factory';

export interface QueryBuilderWhereDate {

  /**
   *  Add a date based (year, month, day, time) statement to the query.
   */
  _addDateBasedWhere(this: QueryBuilder, type: string, column: string, operator: string, value: any,
                     conjunction: string): this;

  orWhereDate(column: string, value?: RawExpression | Date | string | number): this;

  orWhereDate(column: string, operator: string,
              value: RawExpression | Date | string | number,
              conjunction?: 'and' | 'or'): this;

  orWhereDay(column: string, value?: RawExpression | Date | string | number): this;

  orWhereDay(column: string, operator: string,
             value: RawExpression | Date | string | number,
             conjunction?: 'and' | 'or'): this;

  orWhereMonth(column: string,
               value?: RawExpression | Date | string | number): QueryBuilder;

  orWhereMonth(column: string, operator: string,
               value: RawExpression | Date | string | number,
               conjunction?: 'and' | 'or'): this;

  orWhereTime(column: string, value?: RawExpression | Date | string | number): this;

  orWhereTime(column: string, operator: string,
              value: RawExpression | Date | string | number,
              conjunction?: 'and' | 'or'): this;

  orWhereYear(column: string, value?: RawExpression | Date | string | number): this;

  orWhereYear(column: string, operator: string,
              value: RawExpression | Date | string | number,
              conjunction?: 'and' | 'or'): this;

  whereDate(column: string, value?: RawExpression | Date | string | number): this;

  whereDate(column: string, operator: string,
            value: RawExpression | Date | string | number,
            conjunction?: 'and' | 'or'): QueryBuilder;

  whereDay(column: string, value?: RawExpression | Date | string | number): this;

  whereDay(column: string, operator: string,
           value?: RawExpression | Date | string | number,
           conjunction?: 'and' | 'or'): this;

  whereMonth(column: string, value?: RawExpression | Date | string | number): this;

  whereMonth(column: string, operator: string,
             value?: RawExpression | Date | string | number,
             conjunction?: 'and' | 'or'): this;

  whereTime(column: string, value?: RawExpression | Date | string | number): this;

  whereTime(column: string, operator: string,
            value?: RawExpression | Date | string | number,
            conjunction?: 'and' | 'or'): this;

  whereYear(column: string, value?: RawExpression | Date | string | number): this;

  whereYear(column: string, operator: string,
            value?: RawExpression | Date | string | number,
            conjunction?: 'and' | 'or'): this;

}

export type WhereDateCtor = Constructor<QueryBuilderWhereDate>;

export function mixinWhereDate<T extends Constructor<any>>(base: T): WhereDateCtor & T {
  return class _Self extends base {
    /**
     *  Add a date based (year, month, day, time) statement to the query.
     */
    _addDateBasedWhere(type: string, column: string, operator: string, value: any,
                       conjunction: 'and' | 'or' = 'and'): WhereDateCtor & T {
      const leftNode = SqlParser.createSqlParser(column).parseUnaryTableColumn();
      let rightNode;

      if (value instanceof RawExpression) {
        rightNode = value;
      } else {
        rightNode = new BindingVariable(new RawExpression(value), 'where');
      }

      this.addWhere(
        new ComparisonPredicateExpression(
          new FunctionCallExpression(
            createIdentifier(type),
            [leftNode]
          ),
          operator,
          rightNode
        ),
        conjunction
      );
      // //todo (!(value instanceof Expression))
      // if (!(value instanceof RawExpression)) {
      //   this.addBinding(value,
      //     'where');
      // }
      // @ts-ignore
      return this;
    }

    public orWhereDate(column: string, operator: string, value?: any) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.whereDate(column, operator, value, 'or');
    }

    public orWhereDay(column: string, operator: string, value?: any) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.whereDay(column, operator, value, 'or');
    }

    public orWhereMonth(column: string, operator: string, value?: any) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.whereMonth(column, operator, value, 'or');
    }

    public orWhereTime(column: string, operator: string, value?: any) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.whereTime(column, operator, value, 'or');
    }

    public orWhereYear(column: string, operator: string, value?: any) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.whereYear(column, operator, value, 'or');
    }

    public whereDate(column: string, operator: string, value?: any,
                     conjunction: 'and' | 'or' = 'and') {
      [value, operator] = this._prepareValueAndOperator(value,
        operator,
        arguments.length === 2);
      if (isDate(value)) {
        value = format(value as Date,
          'yyyy-MM-dd');
      }
      return this._addDateBasedWhere('Date',
        column,
        operator,
        value,
        conjunction);
    }

    public whereDay(column: string, operator: string, value?: any,
                    conjunction: 'and' | 'or' = 'and') {
      [value, operator] = this._prepareValueAndOperator(value,
        operator,
        arguments.length === 2);
      if (isDate(value)) {
        value = format(value,
          'dd');
      }
      if (isString(value) || isNumber(value)) {
        // @ts-ignore
        value = `${value}`.padStart(2, '0');
      }
      return this._addDateBasedWhere('Day',
        column,
        operator,
        value,
        conjunction);
    }

    public whereMonth(column: string, operator: string, value?: any,
                      conjunction: 'and' | 'or' = 'and') {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      if (isDate(value)) {
        value = format(value,
          'MM');
      }
      if (isString(value) || isNumber(value)) {
        // @ts-ignore
        value = `${value}`.padStart(2, '0');
      }
      return this._addDateBasedWhere('Month',
        column,
        operator,
        value,
        conjunction);
    }

    public whereTime(column: string, operator: string, value?: any, conjunction: 'and' | 'or' = 'and') {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      if (isDate(value)) {
        value = format(value,
          'hh:mm:ss');
      }
      return this._addDateBasedWhere('Time',
        column,
        operator,
        value,
        conjunction);
    }

    public whereYear(column: string, operator: string, value?: any, conjunction: 'and' | 'or' = 'and') {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      if (isDate(value)) {
        value = format(value,
          'yyyy');
      }
      return this._addDateBasedWhere('Year',
        column,
        operator,
        value,
        conjunction);
    }

  };
}
