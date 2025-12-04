/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { FedacoBuilder } from '../../fedaco/fedaco-builder';
import type { Constructor } from '../../helper/constructor';
import { BindingVariable } from '../../query/ast/binding-variable';
import { BetweenPredicateExpression } from '../../query/ast/expression/between-predicate-expression';
import { ExistsPredicateExpression } from '../../query/ast/expression/exists-predicate-expression';
import { InPredicateExpression } from '../../query/ast/expression/in-predicate-expression';
import { NullPredicateExpression } from '../../query/ast/expression/null-predicate-expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { NestedExpression } from '../../query/ast/fragment/nested-expression';
import { SqlParser } from '../../query/parser/sql-parser';
import { raw } from '../ast-factory';
import { wrapToArray } from '../ast-helper';
import type { QueryBuilder } from '../query-builder';
import type { QueryBuilderWhereCommon } from './where-common';

export interface QueryBuilderWherePredicate {
  addWhereExistsQuery(query: QueryBuilder, conjunction?: string, not?: boolean): void;

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

  /* Add an "or where null" clause to the query. */
  orWhereNull(column: string | string[]): this;

  whereBetween(column: string, values: any[], conjunction?: string, not?: boolean): this;

  whereExists(callback: (q: QueryBuilder) => void, conjunction?: string, not?: boolean): void;

  whereIn(column: string, q: (q: this) => void): this;

  whereIn(column: string, q: QueryBuilder): this;

  whereIn(column: string, q: FedacoBuilder): this;

  whereIn(column: string, values: any[], conjunction?: string, not?: boolean): this;

  whereIntegerInRaw(column: string, values: any[], conjunction?: string, not?: boolean): this;

  whereIntegerNotInRaw(column: string, values: any[], conjunction?: string): this;

  whereNotBetween(column: string, values: any[], conjunction?: string): this;

  whereNotExists(callback: Function, conjunction?: string): void;

  whereNotIn(column: string, q: (q: this) => void): this;

  whereNotIn(column: string, values: any[], conjunction?: string): this;

  /* Add a "where not null" clause to the query. */
  whereNotNull(columns: string | any[], conjunction?: string): this;

  whereNull(columns: string | any[], conjunction?: string, not?: boolean): this;

  whereNull(column: string): this;
}

export type WherePredicateCtor = Constructor<QueryBuilderWherePredicate>;

export function mixinWherePredicate<T extends Constructor<any>>(base: T): WherePredicateCtor & T {
  return class _Self extends base {
    /* Add an exists clause to the query. */
    public addWhereExistsQuery(
      this: QueryBuilder & _Self,
      query: QueryBuilder,
      conjunction: 'and' | 'or' = 'and',
      not = false,
    ) {
      // const type = not ? 'NotExists' : 'Exists';
      // this.qWheres.push(compact('type', 'query', 'boolean'));
      // this.addBinding(query.getBindings(), 'where');

      this.addWhere(new ExistsPredicateExpression(new NestedExpression('where', query, []), not), conjunction);
      return this;
    }

    /**
     * Add an or where between statement to the query.
     */
    public orWhereBetween(this: QueryBuilder & _Self, column: string, values: any[], not = false) {
      return this.whereBetween(column, values, 'or', not);
    }

    /* Add an or exists clause to the query. */
    public orWhereExists(this: QueryBuilder & _Self, callback: Function, not = false) {
      return this.whereExists(callback, 'or', not);
    }

    public orWhereIn(this: QueryBuilder & QueryBuilderWhereCommon & _Self, column: string, values: any[], not = false) {
      return this.whereIn(column, values, 'or', not);
    }

    /* Add an "or where in raw" clause for integer values to the query. */
    public orWhereIntegerInRaw(this: QueryBuilder & _Self, column: string, values: any[]) {
      return this.whereIntegerInRaw(column, values, 'or');
    }

    /* Add an "or where not in raw" clause for integer values to the query. */
    public orWhereIntegerNotInRaw(this: QueryBuilder & _Self, column: string, values: any[]) {
      return this.whereIntegerNotInRaw(column, values, 'or');
    }

    /**
     * Add an or where not between statement to the query.
     */
    public orWhereNotBetween(this: QueryBuilder & _Self, column: string, values: any[]) {
      return this.whereNotBetween(column, values, 'or');
    }

    /* Add a where not exists clause to the query. */
    public orWhereNotExists(this: QueryBuilder & _Self, callback: Function) {
      return this.orWhereExists(callback, true);
    }

    public orWhereNotIn(this: QueryBuilder & QueryBuilderWhereCommon & _Self, column: string, values: any[]) {
      return this.whereNotIn(column, values, 'or');
    }

    public orWhereNotNull(column: string) {
      return this.whereNull(column, 'or', true);
    }

    /* Add an "or where null" clause to the query. */
    public orWhereNull(column: string) {
      return this.whereNull(column, 'or');
    }

    /**
     * Add a where between statement to the query.
     */
    public whereBetween(
      this: QueryBuilder & QueryBuilderWhereCommon,
      column: string,
      values: any[],
      conjunction: 'and' | 'or' = 'and',
      not = false,
    ) {
      const expression = SqlParser.createSqlParser(column).parseColumnAlias();
      const [left, right] = values;
      const leftBetween = left instanceof RawExpression ? left : new BindingVariable(new RawExpression(left), 'where');
      const rightBetween =
        right instanceof RawExpression ? right : new BindingVariable(new RawExpression(right), 'where');
      this.addWhere(new BetweenPredicateExpression(expression, leftBetween, rightBetween, not), conjunction);
      // this.qWheres.push([type, column, values, bool, not]);
      // todo
      // this.addBinding(this.cleanBindings(values), 'where');
      return this;
    }

    /* Add an exists clause to the query. */
    public whereExists(this: QueryBuilder & _Self, callback: Function, conjunction = 'and', not = false) {
      const query = this._forSubQuery();
      callback(query);
      return this.addWhereExistsQuery(query, conjunction, not);
    }

    public whereIn(
      this: QueryBuilder & QueryBuilderWhereCommon & _Self,
      column: string,
      values: any | any[],
      conjunction: 'and' | 'or' = 'and',
      not = false,
    ) {
      const expression = SqlParser.createSqlParser(column).parseUnaryTableColumn();
      let subQuery,
        valueArray: any[] = [];
      if (this.isQueryable(values)) {
        subQuery = this._createSubQuery('where', values);
        // this.addBinding(bindings, 'where')
      } else {
        valueArray = values.map((it: any) =>
          it instanceof RawExpression ? it : new BindingVariable(new RawExpression(it)),
        );
      }

      this.addWhere(new InPredicateExpression(expression, valueArray, subQuery, not), conjunction);
      // this.qWheres.push([type, column, values, bool, not]);
      // todo
      // this.addBinding(this.cleanBindings(values), 'where');
      return this;
    }

    /* Add a "where in raw" clause for integer values to the query. */
    public whereIntegerInRaw(
      this: QueryBuilder & _Self,
      column: string,
      values: any[],
      conjunction = 'and',
      not = false,
    ) {
      return this.whereIn(
        column,
        values.map((it) => {
          return raw(parseInt(it));
        }),
        conjunction,
        not,
      );
    }

    /* Add a "where not in raw" clause for integer values to the query. */
    public whereIntegerNotInRaw(this: QueryBuilder & _Self, column: string, values: any[], conjunction = 'and') {
      return this.whereIntegerInRaw(column, values, conjunction, true);
    }

    /**
     * Add a where not between statement to the query.
     */
    public whereNotBetween(this: QueryBuilder & _Self, column: string, values: any[], conjuction = 'and') {
      return this.whereBetween(column, values, conjuction, true);
    }

    /* Add a where not exists clause to the query. */
    public whereNotExists(this: QueryBuilder & _Self, callback: Function, conjunction = 'and') {
      return this.whereExists(callback, conjunction, true);
    }

    public whereNotIn(this: QueryBuilder & _Self, column: string, values: any[], conjuction = 'and') {
      return this.whereIn(column, values, conjuction, true);
    }

    /* Add a "where not null" clause to the query. */
    public whereNotNull(columns: string | any[], conjunction = 'and') {
      return this.whereNull(columns, conjunction, true);
    }

    /* Add a "where null" clause to the query. */
    public whereNull(columns: string | any[], conjunction = 'and', not = false) {
      for (const column of wrapToArray(columns)) {
        const ast = SqlParser.createSqlParser(column).parseColumnAlias();
        this.addWhere(new NullPredicateExpression(ast, not), conjunction);
      }
      return this;
    }
  };
}
