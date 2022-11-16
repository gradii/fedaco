/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isFunction, isString } from '@gradii/nanofn';
import type { Constructor } from '../../helper/constructor';
import type { JoinClauseBuilder, QueryBuilder } from '../../query-builder/query-builder';
import { JoinFragment } from '../../query/ast/fragment/join-fragment';
import { JoinExpression } from '../../query/ast/join-expression';
import { JoinOnExpression } from '../../query/ast/join-on-expression';
import { TableReferenceExpression } from '../../query/ast/table-reference-expression';
import { SqlParser } from '../../query/parser/sql-parser';
import { bindingVariable, createIdentifier } from '../ast-factory';

export interface QueryBuilderJoin {
  join(table: string | TableReferenceExpression,
       first: string | ((...args: any[]) => any),
       operator: string, second: any, type?: string, where?: any): this;

  join(table: string, first: string | ((...args: any[]) => any), second: any): this;

  join(table: string, on: (q: JoinClauseBuilder) => void): this;

  join(tableOrJoinSql: string): this;

  joinWhere(table: string, first: ((q: JoinClauseBuilder) => void) | string, operator: string, second: string,
            type?: string): this;

  joinSub(query: ((q: JoinClauseBuilder) => void) | QueryBuilder | string, as: string, first: Function | string,
          operator?: string,
          second?: string | number, type?: string, where?: boolean): this;

  leftJoin(table: string, first: (q: JoinClauseBuilder) => void, operator?: string,
           second?: string): this;

  leftJoin(table: string, first: ((q: JoinClauseBuilder) => void) | string, operator?: string, second?: string): this;

  leftJoinWhere(table: string, first: ((q: JoinClauseBuilder) => void) | string, operator: string, second: string): this;

  leftJoinSub(query:  ((q: JoinClauseBuilder) => void) | QueryBuilder | string, as: string, first: Function | string,
              operator?: string,
              second?: string): this;

  rightJoin(table: string, first: ((q: JoinClauseBuilder) => void) | string, operator?: string, second?: string): this;

  rightJoinWhere(table: string, first: ((q: JoinClauseBuilder) => void) | string, operator: string, second: string): this;

  rightJoinSub(query: ((q: JoinClauseBuilder) => void) | QueryBuilder | string, as: string, first: Function | string,
               operator?: string,
               second?: string): this;

  crossJoin(table: string, first?: ((q: JoinClauseBuilder) => void) | string, operator?: string, second?: string): this;
}

export type QueryBuilderJoinCtor = Constructor<QueryBuilderJoin>;

export function mixinJoin<T extends Constructor<any>>(base: T): QueryBuilderJoinCtor & T {
  return class _Self extends base {

    public join(this: QueryBuilder & _Self,
                table: string | TableReferenceExpression,
                first?: string | ((...args: any[]) => any),
                operator?: string, second?: any,
                type: string   = 'inner',
                where: boolean = false) {

      if (isFunction(first)) {
        const join = this._newJoinClause(this, type, table);
        first(join);
        this._joins.push(new JoinFragment(join));

        return this;
      }

      if (arguments.length === 1) {
        if (isString(table)) {
          const ast = SqlParser.createSqlParser(table).parseJoin();
          this._joins.push(ast);
        } else {
          throw new Error('invalid table name');
        }
      } else if (arguments.length === 2) {// const node =

      } else if (
        arguments.length === 3 || arguments.length === 4 ||
        arguments.length === 5 || arguments.length === 6
      ) {
        if (arguments.length === 3) {
          second   = operator;
          operator = '=';
        }

        let tableNode;
        if (isString(table)) {
          tableNode = SqlParser.createSqlParser(table).parseTableAlias();
        } else if (table instanceof TableReferenceExpression) {
          tableNode = table;
        } else {
          throw new Error('invalid table type');
        }

        let left, right;
        if (this.isQueryable(first)) {
          const join = this._newJoinClause(this, type, tableNode);
          if (isFunction(first)) {
            first(join);
            left = new JoinFragment(join);
          } else {
            throw new Error('invalid join');
          }

        } else {
          left = SqlParser.createSqlParser(first).parseUnaryTableColumn();
        }
        if (where) {
          right = bindingVariable(second, 'join');
        } else if (isString(second)) {
          right = SqlParser.createSqlParser(second).parseUnaryTableColumn();
        } else {
        }

        this._joins.push(
          new JoinExpression(
            type,
            tableNode,
            new JoinOnExpression(
              left,
              operator,
              right
            )
          )
        );
      }

      return this;
    }

    /*Add a "join where" clause to the query.*/
    public joinWhere(this: QueryBuilder & _Self, table: string,
                     first: ((...args: any[]) => any) | string,
                     operator: string,
                     second: string, type: string = 'inner') {
      return this.join(table, first, operator, second, type, true);
    }

    /*Add a subquery join clause to the query.*/
    public joinSub(this: QueryBuilder & _Self, query: Function | QueryBuilder | string, as: string,
                   first: ((...args: any[]) => any) | string,
                   operator: string = null, second: string = null, type: string = 'inner',
                   where: boolean                                               = false) {
      const node       = this._createSubQuery('join', query);
      const expression = new TableReferenceExpression(node,
        as ? createIdentifier(as) : undefined);

      return this.join(expression, first, operator, second, type, where);
    }

    /*Add a left join to the query.*/
    public leftJoin(this: QueryBuilder & _Self, table: string,
                    first: ((...args: any[]) => any) | string,
                    operator: string = null,
                    second: string   = null) {
      return this.join(table, first, operator, second, 'left');
    }

    /*Add a "join where" clause to the query.*/
    public leftJoinWhere(this: QueryBuilder & _Self, table: string,
                         first: ((...args: any[]) => any) | string,
                         operator: string,
                         second: string) {
      return this.joinWhere(table, first, operator, second, 'left');
    }

    /*Add a subquery left join to the query.*/
    public leftJoinSub(this: QueryBuilder & _Self, query: Function | QueryBuilder | string,
                       as: string,
                       first: ((...args: any[]) => any) | string,
                       operator: string = null, second: string = null) {
      return this.joinSub(query, as, first, operator, second, 'left');
    }

    /*Add a right join to the query.*/
    public rightJoin(this: QueryBuilder & _Self, table: string,
                     first: ((...args: any[]) => any) | string,
                     operator: string = null,
                     second: string   = null) {
      return this.join(table, first, operator, second, 'right');
    }

    /*Add a "right join where" clause to the query.*/
    public rightJoinWhere(this: QueryBuilder & _Self, table: string,
                          first: ((...args: any[]) => any) | string,
                          operator: string,
                          second: string) {
      return this.joinWhere(table, first, operator, second, 'right');
    }

    /*Add a subquery right join to the query.*/
    public rightJoinSub(this: QueryBuilder & _Self, query: Function | QueryBuilder | string,
                        as: string,
                        first: ((...args: any[]) => any) | string,
                        operator: string = null, second: string = null) {
      return this.joinSub(query, as, first, operator, second, 'right');
    }

    /*Add a "cross join" clause to the query.*/
    public crossJoin(this: QueryBuilder & _Self,
                     table: string,
                     first?: ((...args: any[]) => any) | string,
                     operator?: string,
                     second?: string) {
      if (first) {
        return this.join(table, first, operator, second, 'cross');
      }
      this._joins.push(
        new JoinFragment(this._newJoinClause(this, 'cross', table))
      );
      return this;
    }

  };
}
