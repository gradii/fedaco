/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/nanofn';
import type { Constructor } from '../../helper/constructor';
import type { QueryBuilder } from '../../query-builder/query-builder';
import { RejectOrderElementExpression } from '../../query/ast/fragment/order/reject-order-element-expression';
import { Identifier } from '../../query/ast/identifier';

export interface QueryBuilderLimitOffset {
  limit(value: number): this;

  skip(value: number): this;

  offset(value: number): this;

  take(value: number): this;

  forPage(pageNo: number, pageSize: number): this;

  forPageBeforeId(perPage?: number, lastId?: number, column ?: string): this;

  forPageAfterId(perPage?: number, lastId?: number, column ?: string): this;
}

export type QueryBuilderLimitOffsetCtor = Constructor<QueryBuilderLimitOffset>;

export function mixinLimitOffset<T extends Constructor<any>>(base: T): QueryBuilderLimitOffsetCtor & T {
  return class _Self extends base {

    /*Set the "limit" value of the query.*/
    public limit(this: QueryBuilder & _Self, value: number) {
      if (value >= 0) {
        if (this._unions.length > 0) {
          this._unionLimit = value;
        } else {
          this._limit = value;
        }
      }
      return this;
    }

    /*Alias to set the "offset" value of the query.*/
    public skip(this: QueryBuilder & _Self, value: number) {
      return this.offset(value);
    }

    /*Set the "offset" value of the query.*/
    public offset(this: QueryBuilder & _Self, value: number) {
      value = Math.max(0, value);
      if (this._unions.length > 0) {
        this._unionOffset = value;
      } else {
        this._offset = value;
      }
      return this;
    }

    /*Alias to set the "limit" value of the query.*/
    public take(this: QueryBuilder & _Self, value: number) {
      return this.limit(value);
    }

    public forPage(this: QueryBuilder & _Self, pageNo: number, pageSize: number) {
      return this.offset((pageNo - 1) * pageSize).limit(pageSize);
    }

    public forPageBeforeId(perPage = 15, lastId = 0, column = 'id'): this {
      this._orders = this._removeExistingOrdersFor(column);
      if (lastId !== null) {
        this.where(column, '<', lastId);
      }
      return this.orderBy(column, 'desc').limit(perPage);
    }

    public forPageAfterId(perPage = 15, lastId = 0, column = 'id'): this {
      this._orders = this._removeExistingOrdersFor(column);
      if (lastId !== null) {
        this.where(column, '>', lastId);
      }
      return this.orderBy(column, 'asc').limit(perPage);
    }

    /*Get an array with all orders with a given column removed.*/
    protected _removeExistingOrdersFor(column: string) {
      return [
        new RejectOrderElementExpression(
          [new Identifier(column)],
          this._orders
        )
      ];
    }
  };
}
