/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isString } from '@gradii/nanofn';
import type { Constructor } from '../../helper/constructor';
import type { QueryBuilder } from '../../query-builder/query-builder';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { OrderByElement } from '../../query/ast/order-by-element';
import { SqlParser } from '../../query/parser/sql-parser';
import type { SqlNode } from '../../query/sql-node';
import { rawSqlBindings } from '../ast-factory';
import { wrapToArray } from '../ast-helper';

export interface QueryBuilderOrderBy {

  latest(column: string): this;

  oldest(column: string): this;

  orderBy(column: ((...args: any[]) => any) | QueryBuilder | RawExpression | string,
          direction?: string): this;

  orderByDesc(column: (q: QueryBuilder) => void): this;

  orderByDesc(column: string): this;

  orderByRaw(sql: string, bindings: any[] | any): this;

  reorder(column?: ((...args: any[]) => any) | QueryBuilder | RawExpression | string,
          direction?: string): this;
}

export type QueryBuilderOrderByCtor = Constructor<QueryBuilderOrderBy>;

export function mixinOrderBy<T extends Constructor<any>>(base: T): QueryBuilderOrderByCtor & T {
  return class _Self extends base {
    public latest(this: QueryBuilder & _Self, column: string = 'created_at') {
      return this.orderBy(column, 'desc');
    }

    /*Add an "order by" clause for a timestamp to the query.*/
    public oldest(this: QueryBuilder & _Self, column: string = 'created_at') {
      return this.orderBy(column, 'asc');
    }

    /**
     * Add an "order by" clause to the query.
     */
    public orderBy(this: QueryBuilder & _Self,
                   column: Function | QueryBuilder | RawExpression | string,
                   direction: string = 'asc') {
      let columnNode;

      if (this.isQueryable(column)) {
        columnNode = this._createSubQuery(this._unions.length > 0 ? 'unionOrder' : 'order', column);
        // const [query, bindings] = this._createSub(column);
        // columnNode              = raw('(' + query + ')');
        // throw new Error('not implement yet');

        // this.addBinding(bindings, this.qUnions ? 'unionOrder' : 'order');
      } else if (column instanceof RawExpression) {
        columnNode = column;
      } else if (isString(column)) {
        columnNode = SqlParser.createSqlParser(column as string).parseUnaryTableColumn();
      } else {
        throw new Error('invalid column type');
      }
      direction = direction.toLowerCase();
      if (!['asc', 'desc'].includes(direction)) {
        throw new Error('InvalidArgumentException Order direction must be "asc" or "desc".');
      }

      this._addOrder(new OrderByElement(
        columnNode,
        direction
      ));
      return this;
    }

    /*Add a descending "order by" clause to the query.*/
    public orderByDesc(this: QueryBuilder & _Self, column: string) {
      return this.orderBy(column, 'desc');
    }

    /*Add a raw "order by" clause to the query.*/
    public orderByRaw(this: QueryBuilder & _Self, sql: string, bindings: any[] = []) {
      // const type = 'Raw';
      // this[this.qUnions ? 'qUnionOrders' : 'qOrders'].push(compact('type', 'sql'));
      // this.addBinding(bindings, this.qUnions ? 'unionOrder' : 'order');
      bindings = wrapToArray(bindings);
      if (this._unions.length > 0) {
        this._unionOrders.push(rawSqlBindings(sql, bindings, 'unionOrder'));
      } else {
        this._orders.push(rawSqlBindings(sql, bindings, 'order'));
      }

      return this;
    }

    /*Remove all existing orders and optionally add a new order.*/
    public reorder(this: QueryBuilder & _Self,
                   column?: ((...args: any[]) => any) | QueryBuilder | RawExpression | string,
                   direction = 'asc') {
      this._orders                 = [];
      this._unionOrders            = [];
      this._bindings['order']      = [];
      this._bindings['unionOrder'] = [];
      if (column) {
        return this.orderBy(column, direction);
      }
      return this;
    }

    protected _addOrder(ast: SqlNode) {
      if (this._unions.length > 0) {
        this._unionOrders.push(ast);
      } else {
        this._orders.push(ast);
      }
      return this;
    }

  };
}
