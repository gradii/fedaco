import { QueryBuilder } from '../query-builder';
import { isObject } from '@gradii/check-type';
import { Constructor } from '../../helper/constructor';
import { BindingVariable } from '../../query/ast/binding-variable';
import { BetweenPredicateExpression } from '../../query/ast/expression/between-predicate-expression';
import { BinaryExpression } from '../../query/ast/expression/binary-expression';
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import { RawBindingExpression } from '../../query/ast/expression/raw-binding-expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { HavingClause } from '../../query/ast/having-clause';
import { SqlParser } from '../../query/parser/sql-parser';
import { SqlNode } from '../../query/sql-node';
import { raw } from '../ast-factory';

export interface QueryBuilderHaving {
  addHaving(where: SqlNode, conjunction: string): this

  having(column: string, value?: string | number | boolean | RawExpression): this

  having(column: string, operator?: string, value?: string | number | boolean | RawExpression, conjunction?: string): this

  havingBetween(column: string, values: any[], conjunction?: string, not?: boolean)

  havingRaw(sql: string): this

  havingRaw(sql: string, bindings: any[], conjunction?: string): this

  orHaving(column: string, value?: string | number | boolean | RawExpression): this

  orHaving(column: string, operator?: string, value?: string | number | boolean | RawExpression): this

  orHavingRaw(sql: string): this

  orHavingRaw(sql: string, bindings: any[]): this

  orHavingRaw(sql: string, bindings: any[]): this
}

export type QueryBuilderHavingCtor = Constructor<QueryBuilderHaving>;

export function mixinHaving<T extends Constructor<any>>(base: T): QueryBuilderHavingCtor & T {
  return class _Self extends base {
    addHaving(this: QueryBuilder & _Self, where: SqlNode, conjunction: 'and' | 'or' | 'andX' | 'orX') {
      if (this._havings.length > 0) {
        if (conjunction === 'and' || conjunction === 'or') {
          const left = this._havings.pop();
          this._havings.push(
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
        this._havings.push(where);
      }
    }

    /*Add a "having" clause to the query.*/
    public having(this: QueryBuilder & _Self, column: string, operator?: string, value?: string,
                  conjunction: string = 'and') {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      if (this._invalidOperator(operator)) {
        [value, operator] = [operator, '='];
      }
      // this._havings.push(compact('type', 'column', 'operator', 'value', 'boolean'));

      const leftNode  = SqlParser.createSqlParser(column).parseColumnAlias();
      const rightNode = ((value as Object) instanceof RawExpression) ?
        // @ts-ignore
        (value as RawExpression) :
        new BindingVariable(raw(value), 'having');
      this.addHaving(
        // new ConditionFactorExpression(),
        new ComparisonPredicateExpression(
          leftNode,
          operator,
          rightNode
        ),
        conjunction
      );

      return this;
    }

    /*Add a "having between " clause to the query.*/
    public havingBetween(this: QueryBuilder & _Self, column: string, values: any[], conjunction: string = 'and', not: boolean = false) {
      const expression    = SqlParser.createSqlParser(column).parseColumnAlias();
      const [left, right] = values;

      let leftBetween, rightBetween;
      leftBetween  = left instanceof RawExpression ?
        left :
        new BindingVariable(raw(left), 'having');
      rightBetween = right instanceof RawExpression ?
        right :
        new BindingVariable(raw(right), 'having');
      this.addHaving(
        new BetweenPredicateExpression(
          expression,
          leftBetween,
          rightBetween,
          not
        ),
        conjunction
      );

      return this;
    }

    /*Add a raw having clause to the query.*/
    public havingRaw(this: QueryBuilder & _Self, sql: string, bindings: any[] = [], conjunction: string = 'and') {
      this.addHaving(
        // new HavingClause(
        new RawBindingExpression(raw(sql), bindings.map(it => new BindingVariable(raw(it), 'having'))),
        conjunction
        // )
      );
      return this;
    }

    /*Add a "or having" clause to the query.*/
    public orHaving(this: QueryBuilder & _Self, column: string, operator?: string, value?: string) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.having(column, operator, value, 'or');
    }

    /*Add a raw or having clause to the query.*/
    public orHavingRaw(this: QueryBuilder & _Self, sql: string, bindings: any[] = []) {
      return this.havingRaw(sql, bindings, 'or');
    }
  };
}
