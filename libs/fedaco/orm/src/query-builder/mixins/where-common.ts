import {
  isArray,
  isFunction,
  isObject,
  isString
} from '@gradii/check-type';
import { Constructor } from '../../helper/constructor';
import { QueryBuilder } from '../../query-builder/query-builder';
import { BindingVariable } from '../../query/ast/binding-variable';
import { BinaryExpression } from '../../query/ast/expression/binary-expression';
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import { RawBindingExpression } from '../../query/ast/expression/raw-binding-expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { NestedPredicateExpression } from '../../query/ast/fragment/expression/nested-predicate-expression';
import { SqlParser } from '../../query/parser/sql-parser';
import { SqlNode } from '../../query/sql-node';
import { forwardRef } from '../forward-ref';

export interface WhereCommon {

  /**
   * Add another query builder as a nested where to the query builder.
   */
  addNestedWhereQuery(query: QueryBuilder, conjunction: 'and' | 'or'): this

  addWhere(where: SqlNode, conjunction?: 'and' | 'or' | 'andX' | 'orX')

  /**
   * Create a new query instance for nested where condition.
   */
  forNestedWhere(): this

  orWhere(where: (q: QueryBuilder) => void): this

  orWhere(column: Function | string | any[], value: any): this

  orWhere(column: Function | string | any[], operator: any, value: any): this

  orWhere(column: Function | string | any[], operator: any, value: (q: QueryBuilder) => void): this

  orWhereColumn(first: string | any[], operator?: string, second?: string)

  orWhereRaw(sql: string, bindings: any[])

  where(columns: any[], arg1: undefined, arg2: undefined, conjunction?: 'and' | 'or'): this

  where(where: any[][]): this

  where(where: { [key: string]: any }): this

  where(where: (q: QueryBuilder) => void): this

  where(left: string,
        right: Function | RawExpression | boolean | string | number | Array<string | number>): this

  where(left: string, operator: string,
        right: Function | RawExpression | boolean | string | number | Array<string | number>): this


  whereColumn(first: string | any[], operator?: string, second?: string, conjunction?: string)

  whereNested(callback: (query?) => void, conjunction?: 'and' | 'or'): this

  whereRaw(sql: string, bindings: any[], conjunction?: 'and' | 'or'): this
}

export type WhereCommonCtor = Constructor<WhereCommon>;

export function mixinWhereCommon<T extends Constructor<any>>(base: T): WhereCommonCtor & T {
  return class _Self extends base {

    /**
     * Add an array of where clauses to the query.
     */
    _addArrayOfWheres(this: QueryBuilder & _Self, column: object | any[], conjunction: 'and' | 'or',
                      method: string = 'where') {
      return this.whereNested(query => {
        if (isArray(column)) {
          for (const it of column) {
            query[method](...it);
          }
        } else if (isObject(column)) {
          for (const [key, value] of Object.entries(column)) {
            query[method](key, '=', value, conjunction);
          }
        }
      }, conjunction);
    }

    /**
     * Add another query builder as a nested where to the query builder.
     */
    public addNestedWhereQuery(this: QueryBuilder & _Self, query: QueryBuilder, conjunction: 'and' | 'or' = 'and') {
      if (query._wheres.length > 0) {
        // const type = 'Nested';
        // this.qWheres.push(compact('type', 'query', 'boolean'));
        // this.addBinding(query.getRawBindings()['where'], 'where');
        this.addWhere(
          new NestedPredicateExpression(query),
          conjunction
        );
      }

      return this;
    }

    addWhere(where: SqlNode, conjunction: 'and' | 'or' | 'andX' | 'orX') {
      if (this._wheres.length > 0) {
        if (conjunction === 'and' || conjunction === 'or') {
          const left = this._wheres.pop();
          this._wheres.push(
            new BinaryExpression(
              left,
              conjunction,
              where
            )
          );
        } else if (conjunction === 'andX' || conjunction === 'orX') {
          throw new Error('not implement');
        } else {
          throw new Error(`conjunction error should be one of 'and' | 'or' | 'andX' | 'orX'`);
        }
      } else {
        this._wheres.push(where);
      }
    }

    /**
     * Create a new query instance for nested where condition.
     */
    public forNestedWhere(this: QueryBuilder & _Self) {
      return this.newQuery().from(forwardRef(() => this._from));
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
    public orWhereColumn(this: QueryBuilder & _Self, first: string | any[], operator?: string, second?: string) {
      return this.whereColumn(first, operator, second, 'or');
    }

    public orWhereRaw(sql: string, bindings: any[]) {
      return this.whereRaw(sql, bindings, 'or');
    }

    //todo
    where(this: QueryBuilder & _Self, column, operator?, value?, conjunction: 'and' | 'or' = 'and') {
      if (isArray(column) || isObject(column)) {
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
          new ComparisonPredicateExpression(
            leftNode,
            operator,
            rightNode
          ),
          conjunction
        );
      } else {
        throw new Error('not implement yet');
      }

      return this;
    }

    /**
     * Add a "where" clause comparing two columns to the query.
     */
    public whereColumn(this: QueryBuilder & _Self, first: string | any[], operator?: string, second?: string,
                       conjunction: 'and' | 'or' = 'and') {
      if (isArray(first)) {
        return this._addArrayOfWheres(first, conjunction, 'whereColumn');
      }
      if (this._invalidOperator(operator)) {
        [second, operator] = [operator, '='];
      }
      const leftNode  = SqlParser.createSqlParser(first).parseUnaryTableColumn();
      const rightNode = SqlParser.createSqlParser(second).parseUnaryTableColumn();
      this.addWhere(
        new ComparisonPredicateExpression(
          leftNode,
          operator,
          rightNode
        ),
        conjunction
      );

      return this;
    }

    whereNested(this: QueryBuilder & _Self, callback: (query) => void, conjunction: 'and' | 'or' = 'and') {
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
          bindings.map(it => {
            return new BindingVariable(
              new RawExpression(it)
            );
          })
        ),
        conjunction
      );

      // this.addBinding(
      //   //cast type array
      //   bindings, 'where');
      return this;
    }

    protected cleanBindings(bindings: any[]) {
      //todo
      return bindings.filter(it => !(it instanceof RawExpression));
    }
  };
}
