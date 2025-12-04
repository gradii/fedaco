/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Constructor } from '../../helper/constructor';
import { BindingVariable } from '../../query/ast/binding-variable';
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import type { Expression } from '../../query/ast/expression/expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { NotExpression } from '../../query/ast/expression/not-expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { SqlParser } from '../../query/parser/sql-parser';
import { bindingVariable, createIdentifier, raw } from '../ast-factory';
import type { QueryBuilder } from '../query-builder';

export interface QueryBuilderWhereJson {
  whereJsonContains(column: any, value: any, conjunction?: 'and' | 'or' | string, not?: boolean): this;

  orWhereJsonContains(column: any, value: any): this;

  whereJsonDoesntContain(column: any, value: any, conjunction?: 'and' | 'or' | string): this;

  orWhereJsonDoesntContain(column: any, value: any): this;

  whereJsonLength(column: any, operator: any, value?: any, conjunction?: 'and' | 'or' | string): this;

  orWhereJsonLength(column: any, operator: any, value?: any): this;
}

export type WhereJsonCtor = Constructor<QueryBuilderWhereJson>;

export function mixinWhereJson<T extends Constructor<any>>(base: T): WhereJsonCtor & T {
  return class _Self extends base {
    #_jsonBasedValue(value: any) {
      if (value instanceof RawExpression) {
        return value;
      } else {
        return new BindingVariable(
          raw((this as unknown as QueryBuilder)._grammar.prepareBindingForJsonContains(value)),
          'where',
        );
      }
    }

    #_based(column: string) {
      return SqlParser.createSqlParser(column).parseColumnWithoutAlias();
    }

    #_addJsonBasedWhere(column: string, value: any, conjunction: 'and' | 'or' | string = 'and', not?: boolean): this {
      const type = 'JsonContains';
      const leftNode = this.#_based(column);
      const rightNode = this.#_jsonBasedValue(value);
      let ast: Expression = new FunctionCallExpression(createIdentifier(type), [leftNode, rightNode]);
      if (not) {
        ast = new NotExpression(ast);
      }

      this.addWhere(ast, conjunction);

      return this;
    }

    #_addJsonLengthBasedWhere(
      column: string,
      operator: string,
      value: any,
      conjunction: 'and' | 'or' | string = 'and',
    ): this {
      const type = 'JsonLength';
      const leftNode = this.#_based(column);
      const rightNode = bindingVariable(value, 'where');
      const ast: Expression = new ComparisonPredicateExpression(
        new FunctionCallExpression(createIdentifier(type), [leftNode]),
        operator,
        rightNode,
      );

      this.addWhere(ast, conjunction);

      return this;
    }

    public whereJsonContains(column: any, value: any, conjunction = 'and', not = false) {
      this.#_addJsonBasedWhere(column, value, conjunction, not);

      return this;
    }

    public orWhereJsonContains(column: any, value: any) {
      return this.whereJsonContains(column, value, 'or');
    }

    public whereJsonDoesntContain(column: any, value: any, conjunction = 'and') {
      return this.whereJsonContains(column, value, conjunction, true);
    }

    public orWhereJsonDoesntContain(column: any, value: any) {
      return this.whereJsonDoesntContain(column, value, 'or');
    }

    public whereJsonLength(column: string, operator: string, value?: any, conjunction = 'and') {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      this.#_addJsonLengthBasedWhere(column, operator, value, conjunction);

      return this;
    }

    public orWhereJsonLength(column: any, operator: any, value?: any) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.whereJsonLength(column, operator, value, 'or');
    }
  };
}
