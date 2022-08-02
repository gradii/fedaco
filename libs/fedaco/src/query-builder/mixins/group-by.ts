/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Constructor } from '../../helper/constructor';
import { BindingVariable } from '../../query/ast/binding-variable';
import { RawBindingExpression } from '../../query/ast/expression/raw-binding-expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { SqlParser } from '../../query/parser/sql-parser';
import { raw } from '../ast-factory';
import { wrapToArray } from '../ast-helper';
import type { QueryBuilder } from '../query-builder';

export interface QueryBuilderGroupBy {
  groupBy(groups: string[]): this;

  groupBy(groups: RawExpression): this;

  groupBy(...args: string[]): this;

  groupByRaw(sql: string | RawExpression, bindings: any[]): this;
}

export type QueryBuilderGroupByCtor = Constructor<QueryBuilderGroupBy>;

export function mixinGroupBy<T extends Constructor<any>>(base: T): QueryBuilderGroupByCtor & T {
  return class _Self extends base {
    /*Add a "group by" clause to the query.*/
    public groupBy(this: QueryBuilder & _Self, ...groups: any[]) {

      for (const group of groups) {
        const newAsts = wrapToArray(group).map(it => {
          if (it instanceof RawExpression) {
            return it;
          }
          return SqlParser.createSqlParser(it).parseColumnAlias();
        });

        this._groups = [...this._groups, ...newAsts];
      }
      return this;
    }

    /*Add a raw groupBy clause to the query.*/
    public groupByRaw(this: QueryBuilder & _Self, sql: string, bindings: any[] = []) {
      this._groups.push(
        new RawBindingExpression(
          raw(sql),
          bindings.map(it => {
            return new BindingVariable(
              raw(it)
            );
          })
        )
      );

      return this;
    }

  };
}
