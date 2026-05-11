/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray, isFunction, isObject, isString } from '@gradii/nanofn';
import type { FedacoBuilder } from '../../fedaco/fedaco-builder';
import type { Constructor } from '../../helper/constructor';
import type { QueryBuilder } from '../../query-builder/query-builder';
import { BindingVariable } from '../../query/ast/binding-variable';
import { BinaryExpression } from '../../query/ast/expression/binary-expression';
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import type { Expression } from '../../query/ast/expression/expression';
import { NotExpression } from '../../query/ast/expression/not-expression';
import { RawBindingExpression } from '../../query/ast/expression/raw-binding-expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { NestedPredicateExpression } from '../../query/ast/fragment/expression/nested-predicate-expression';
import { SqlParser } from '../../query/parser/sql-parser';
import type { SqlNode } from '../../query/sql-node';
import { forwardRef } from '../forward-ref';

export interface QueryBuilderWhereCommon {
  /**
   * Add another query builder as a nested where to the query builder.
   */
  addNestedWhereQuery(query: QueryBuilder, conjunction: 'and' | 'or' | string): this;

  addWhere(where: SqlNode, conjunction?: 'and' | 'or' | 'and not' | 'or not' | 'andX' | 'orX'): this;

  /**
   * Create a new query instance for nested where condition.
   */
  forNestedWhere(): this;

  orWhere(where: (q: this) => void): this;

  orWhere(column: ((q: this) => void) | string | any[], value: any): this;

  orWhere(column: ((q: this) => void) | string | any[], operator: any, value: (q: this) => void): this;

  orWhere(column: ((q: this) => void) | string | any[], operator: any, value: any): this;

  orWhereColumn(first: string | any[], second?: string): this;

  orWhereColumn(first: string | any[], operator?: string, second?: string): this;

  orWhereRaw(sql: string, bindings?: any[]): this;

  orWhereNot(column: ((q: this) => void) | string | any[], operator?: any, value?: any): this;

  where(where: any[][]): this;

  where(where: (q: this) => void): this;

  where(where: (q: this) => void): this;

  where(where: { [key: string]: any }): this;

  where(where: (q: QueryBuilder) => void): this;

  where(
    left: string,
    right: ((q: this) => void) | RawExpression | boolean | string | number | Array<string | number>,
  ): this;

  where(
    left: string,
    operator: string,
    right: ((q: this) => void) | RawExpression | boolean | string | number | Array<string | number>,
  ): this;

  where(
    left: string,
    operator: string,
    right: ((q: this) => void) | RawExpression | boolean | string | number | Array<string | number>,
    conjunction: 'and' | 'or' | string,
  ): this;

  where(
    left: ((q: this) => void) | string | any[],
    operator: string,
    right: ((q: this) => void) | RawExpression | boolean | string | number | Array<string | number>,
    conjunction: 'and' | 'or' | 'and not' | 'or not' | string,
  ): this;

  whereColumn(first: any[], conjunction?: string): this;

  whereColumn(first: string | Expression, second: string | number | boolean, conjunction: string): this;

  whereColumn(first: Expression, operator: string, second: string | number | boolean | Expression, conjunction?: string): this;

  whereColumn(first: string | any[] | Expression | RawBindingExpression, operator?: string, second?: string, conjunction?: string): this;

  whereNested(callback: (query?: QueryBuilder) => void, conjunction?: 'and' | 'or' | string): this;

  whereNot(
    column: ((q: this) => void) | string | any[],
    operator?: any,
    value?: any,
    conjunction?: 'and' | 'or',
  ): this;

  whereRaw(sql: string, bindings?: any[], conjunction?: 'and' | 'or'): this;
}

export type WhereCommonCtor = Constructor<QueryBuilderWhereCommon>;

export function mixinWhereCommon<T extends Constructor<any>>(base: T): WhereCommonCtor & T {
  return class _Self extends base {
    /**
     * Add an array of where clauses to the query.
     */
    _addArrayOfWheres(column: object | any[], conjunction: 'and' | 'or' | string, method = 'where'): this {
      return this.whereNested((query) => {
        if (isArray(column)) {
          for (const it of column) {
            // @ts-ignore
            query[method](...it);
          }
        } else if (isObject(column)) {
          for (const [key, value] of Object.entries(column)) {
            // @ts-ignore
            query[method](key, '=', value, conjunction);
          }
        }
      }, conjunction);
    }

    /**
     * Add another query builder as a nested where to the query builder.
     */
    public addNestedWhereQuery(query: QueryBuilder, conjunction: 'and' | 'or' | string = 'and'): this {
      if (query._wheres.length > 0) {
        // const type = 'Nested';
        // this.qWheres.push(compact('type', 'query', 'boolean'));
        // this.addBinding(query.getRawBindings()['where'], 'where');
        this.addWhere(new NestedPredicateExpression(query), conjunction);
      }

      return this;
    }

    addWhere(where: SqlNode, conjunction: 'and' | 'or' | 'and not' | 'or not' | 'andX' | 'orX' | string) {
      let conj = conjunction;
      if (conjunction === 'and not' || conjunction === 'or not') {
        where = new NotExpression(where as Expression);
        conj = conjunction === 'and not' ? 'and' : 'or';
      }
      if (this._wheres.length > 0) {
        if (conj === 'and' || conj === 'or') {
          const left = this._wheres.pop();
          this._wheres.push(new BinaryExpression(left, conj, where));
        } else if (conj === 'andX' || conj === 'orX') {
          throw new Error('not implement');
        } else {
          throw new Error(`conjunction error should be one of 'and' | 'or' | 'and not' | 'or not' | 'andX' | 'orX'`);
        }
      } else {
        this._wheres.push(where);
      }
    }

    /**
     * Create a new query instance for nested where condition.
     */
    public forNestedWhere() {
      // @ts-ignore
      return (this as QueryBuilder & _Self).newQuery().from(forwardRef(() => this._from));
    }

    /**
     * Add an "or where" clause to the query.
     */
    public orWhere(this: QueryBuilder & _Self, column: Function | string | any[], operator?: any, value?: any) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.where(column, operator, value, 'or');
    }

    /**
     * Add an "or where" clause comparing two columns to the query.
     */
    public orWhereColumn(first: string | any[] | Expression, second?: string): this;
    public orWhereColumn(first: string | any[] | Expression, operator?: string, second?: string): this {
      if (arguments.length === 2) {
        second = operator;
        operator = '=';
      }
      return this.whereColumn(first, operator, second, 'or');
    }

    public orWhereRaw(sql: string, bindings: any[]) {
      return this.whereRaw(sql, bindings, 'or');
    }

    // todo
    where(
      this: QueryBuilder & _Self,
      column: any[] | object | Function | any,
      operator?: string,
      value?: any,
      conjunction: 'and' | 'or' | 'and not' | 'or not' | string = 'and',
    ) {
      if ((isArray(column) || isObject(column)) && !(column instanceof RawExpression)) {
        return this._addArrayOfWheres(column, conjunction);
      }
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);

      if (isFunction(column)) {
        this.addWhere(this._createSubPredicate(column), conjunction);
      } else if (isString(column)) {
        const leftNode = SqlParser.createSqlParser(column).parseColumnAlias();
        let rightNode;
        if (isFunction(value)) {
          rightNode = this._createSubQuery('where', value);
        } else if (value instanceof RawExpression) {
          rightNode = value;
        } else {
          rightNode = new BindingVariable(new RawExpression(value), 'where');
        }
        this.addWhere(
          // new ConditionFactorExpression(),
          new ComparisonPredicateExpression(leftNode, operator, rightNode),
          conjunction,
        );
      } else {
        throw new Error('not implement yet');
      }

      return this;
    }

    /**
     * Add a basic "where not" clause to the query.
     */
    public whereNot(
      this: QueryBuilder & _Self,
      column: any[] | object | Function | any,
      operator?: any,
      value?: any,
      conjunction: 'and' | 'or' = 'and',
    ) {
      if ((isArray(column) || isObject(column)) && !(column instanceof RawExpression)) {
        this.whereNested((query) => {
          (query as QueryBuilder & _Self).where(column, operator, value, conjunction);
        }, conjunction === 'or' ? 'or not' : 'and not');
        return this;
      }
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      this.where(column, operator, value, conjunction === 'or' ? 'or not' : 'and not');
      return this;
    }

    /**
     * Add an "or where not" clause to the query.
     */
    public orWhereNot(
      this: QueryBuilder & _Self,
      column: any[] | object | Function | any,
      operator?: any,
      value?: any,
    ) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      this.whereNot(column, operator, value, 'or');
      return this;
    }

    public whereColumn(first: any[], conjunction?: 'and' | 'or' | string): this;
    public whereColumn(
      first: string | any[] | Expression,
      second?: string | Expression,
      conjunction?: 'and' | 'or' | string,
    ): this;
    public whereColumn(
      first: string | any[] | Expression,
      operator?: string,
      second?: string | Expression,
      conjunction?: 'and' | 'or' | string,
    ): this;
    /**
     * Add a "where" clause comparing two columns to the query.
     */
    public whereColumn(
      first: string | any[] | Expression,
      operator?: string | Expression | 'and' | 'or',
      second?: string | Expression | 'and' | 'or',
      conjunction: 'and' | 'or' | string = 'and',
    ): this {
      if (isArray(first)) {
        conjunction = operator as 'and' | 'or';
        return this._addArrayOfWheres(first, conjunction, 'whereColumn');
      }
      if (this._invalidOperator(operator)) {
        conjunction = second as 'and' | 'or';
        [second, operator] = [operator, '='];
      }
      const leftNode =
        first instanceof RawExpression ? first : SqlParser.createSqlParser(first as string).parseUnaryTableColumn();
      const rightNode =
        second instanceof RawExpression ? second : SqlParser.createSqlParser(second as string).parseUnaryTableColumn();
      this.addWhere(
        new ComparisonPredicateExpression(leftNode, operator as string, rightNode),
        conjunction as 'and' | 'or',
      );

      return this;
    }

    whereNested(
      callback: (query: QueryBuilder | FedacoBuilder) => void,
      conjunction: 'and' | 'or' | string = 'and',
    ): this {
      const query = this.forNestedWhere();
      callback(query);
      return this.addNestedWhereQuery(query, conjunction);
    }

    /**
     * Add a raw where clause to the query.
     */
    public whereRaw(sql: string, bindings: any[] = [], conjunction: 'and' | 'or' = 'and') {
      this.addWhere(
        new RawBindingExpression(
          new RawExpression(sql),
          bindings.map((it) => {
            return new BindingVariable(new RawExpression(it));
          }),
        ),
        conjunction,
      );

      // this.addBinding(
      //   //cast type array
      //   bindings, 'where');
      return this;
    }

    protected cleanBindings(bindings: any[]) {
      // todo
      return bindings.filter((it) => !(it instanceof RawExpression));
    }
  };
}
