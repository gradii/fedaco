import { Constructor } from '../../helper/constructor';
import { QueryBuilder } from '../../query-builder/query-builder';

export interface QueryBuilderLimitOffset {
  limit(value: number): this

  skip(value: number): this

  offset(value: number): this

  take(value: number): this

  forPage(pageNo: number, pageSize: number ): this
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

    public forPage(this: QueryBuilder & _Self, pageNo: number, pageSize: number ) {
      return this.offset((pageNo - 1) * pageSize).limit(pageSize);
    }
  };
}
