import { isFunction } from '@gradii/check-type';
import { Constructor } from '../../helper/constructor';
import { QueryBuilder } from '../../query-builder/query-builder';
import { UnionFragment } from '../../query/ast/fragment/union-fragment';

export interface QueryBuilderUnion {
  union(query: QueryBuilder | Function, all?: boolean): this

  unionAll(query: QueryBuilder | Function): this
}

export type QueryBuilderUnionCtor = Constructor<QueryBuilderUnion>;

export function mixinUnion<T extends Constructor<any>>(base: T): QueryBuilderUnionCtor & T {
  return class _Self extends base {

    /*Add a union statement to the query.*/
    public union(this: QueryBuilder & _Self, query: QueryBuilder | Function, all: boolean = false) {
      if (isFunction(query)) {
        query(query = this.newQuery());
      }
      this._unions.push(
        new UnionFragment(query as QueryBuilder, all)
      );

      return this;
    }

    /*Add a union all statement to the query.*/
    public unionAll(this: QueryBuilder & _Self, query: QueryBuilder | Function) {
      return this.union(query, true);
    }

  };
}
