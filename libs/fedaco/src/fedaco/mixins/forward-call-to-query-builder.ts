/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Constructor } from '../../helper/constructor';
import type { ConnectionInterface } from '../../query-builder/connection-interface';
import type { QueryBuilderAggregate } from '../../query-builder/mixins/aggregate';
import type { BuildQueries } from '../../query-builder/mixins/build-query';
import type { QueryBuilderGroupBy } from '../../query-builder/mixins/group-by';
import type { QueryBuilderHaving } from '../../query-builder/mixins/having';
import type { QueryBuilderJoin } from '../../query-builder/mixins/join';
import type { QueryBuilderLimitOffset } from '../../query-builder/mixins/limit-offset';
import type { QueryBuilderOrderBy } from '../../query-builder/mixins/order-by';
import type { QueryBuilderUnion } from '../../query-builder/mixins/union';
import type { QueryBuilderWhereCommon } from '../../query-builder/mixins/where-common';
import type { QueryBuilderWhereDate } from '../../query-builder/mixins/where-date';
import type { QueryBuilderWhereJson } from '../../query-builder/mixins/where-json';
import type { QueryBuilderWherePredicate } from '../../query-builder/mixins/where-predicate';
import type { JoinClauseBuilder, QueryBuilder } from '../../query-builder/query-builder';
import type { FedacoBuilder } from '../fedaco-builder';

export interface ForwardCallToQueryBuilder extends Omit<QueryBuilderJoin, 'joinSub'>, QueryBuilderOrderBy,
  QueryBuilderGroupBy, QueryBuilderHaving, QueryBuilderLimitOffset, QueryBuilderUnion,
  QueryBuilderWhereDate, QueryBuilderWhereJson, QueryBuilderAggregate, QueryBuilderWherePredicate,
  QueryBuilderWhereCommon,
  Constructor<Omit<BuildQueries, 'first'>>,
  Pick<QueryBuilder, 'beforeQuery' | 'find' | 'applyBeforeQueryCallbacks'> {
  pluck(...args: any[]): Promise<any[] | Record<string, any>>;

  stripTableForPluck(...args: any[]): this;

  pluckFromColumn(...args: any[]): this;

  addBinding(...args: any[]): this;

  addSelect(...args: any[]): this;

  distinct(...args: any[]): this;

  insertGetId(...args: any[]): this;

  from(...args: any[]): this;

  fromSub(...args: any[]): this;

  get(...args: any[]): Promise<any[]>;

  getBindings(...args: any[]): this;

  getConnection(...args: any[]): ConnectionInterface;

  insertUsing(...args: any[]): this;

  insertOrIgnore(...args: any[]): this;

  getGrammar(...args: any[]): this;

  getProcessor(...args: any[]): this;

  getRawBindings(...args: any[]): this;

  isQueryable(...args: any[]): this;

  newQuery(...args: any[]): this;

  runSelect(...args: any[]): this;

  selectRaw(...args: any[]): this;

  select(...args: any[]): this;

  update(...args: any[]): Promise<any>;

  delete(...args: any[]): Promise<any>;

  forceDelete(...args: any[]): Promise<any>;

  // withoutGlobalScope(...args: any[]): this;

  truncate(): this;

  updateOrInsert(...args: any[]): this;

  insert(...args: any[]): Promise<any>;

  selectSub(...args: any[]): this;

  lock(...args: any[]): this;

  toSql(...args: any[]): { result: string, bindings: any[] };

  find(...args: any[]): Promise<any | any[]>;

  resetBindings(...args: any[]): this;

  useReadConnection(...args: any[]): this;

  useWriteConnection(...args: any[]): this;

  onceWithColumns(...args: any[]): this;

  first(...args: any[]): Promise<any>;

  join(...args: any[]): this;

  joinSub(query: Function | QueryBuilder | FedacoBuilder | string, as: string,
          first: ((join: JoinClauseBuilder) => any) | string,
          operator?: string,
          second?: string | number, type?: string, where?: boolean): this;

  pipe(...args: any[]): this;
}

export type ForwardCallToQueryBuilderCtor = Constructor<ForwardCallToQueryBuilder>;

export function mixinForwardCallToQueryBuilder<T extends Constructor<any>>(base: T): ForwardCallToQueryBuilderCtor & T {

  return class _Self extends base {

    // @ts-ignore
    #passThroughToQueryBuilder(method: string, parameters: any[]) {
      const _query = this.toBase();
      const result = _query[method].apply(_query, parameters);
      if (result === _query) {
        return this;
      }
      return result;
    }

    // @ts-ignore
    #forwardCallToQueryBuilder(method: string, parameters: any[]) {
      const result = this._query[method].apply(this._query, parameters);
      if (result === this._query) {
        return this;
      }
      return result;
    }

    // @ts-ignore
    #directToQueryBuilder(method: string, parameters: any[]) {
      const _query = this.toBase();
      return _query[method].apply(_query, parameters);
    }

    // @ts-ignore
    #directToBuilder(method: string, parameters: any[]) {
      return this._query[method](...parameters);
    }

    average(...args: any[]) {
      return this.#forwardCallToQueryBuilder('average', args);
    }

    avg(...args: any[]) {
      return this.#forwardCallToQueryBuilder('avg', args);
    }

    pluck(...args: any[]) {
      return this.#forwardCallToQueryBuilder('pluck', args);
    }

    stripTableForPluck(...args: any[]) {
      return this.#forwardCallToQueryBuilder('stripTableForPluck', args);
    }

    pluckFromColumn(...args: any[]) {
      return this.#forwardCallToQueryBuilder('pluckFromColumn', args);
    }

    addBinding(...args: any[]) {
      return this.#forwardCallToQueryBuilder('addBinding', args);
    }

    addSelect(...args: any[]) {
      return this.#forwardCallToQueryBuilder('addSelect', args);
    }

    distinct(...args: any[]) {
      return this.#directToQueryBuilder('distinct', args);
    }

    insertGetId(...args: any[]) {
      return this.#directToQueryBuilder('insertGetId', args);
    }

    from(...args: any[]) {
      return this.#forwardCallToQueryBuilder('from', args);
    }

    fromSub(...args: any[]) {
      return this.#forwardCallToQueryBuilder('fromSub', args);
    }

    get(...args: any[]) {
      return this.#directToQueryBuilder('get', args);
    }

    // getBindings(...args: any[]) {
    //   return this.#forwardCallToQueryBuilder('getBindings', args);
    // }

    getConnection(...args: any[]) {
      return this.#forwardCallToQueryBuilder('getConnection', args);
    }

    insertUsing(...args: any[]) {
      return this.#directToQueryBuilder('insertUsing', args);
    }

    insertOrIgnore(...args: any[]) {
      return this.#directToQueryBuilder('insertOrIgnore', args);
    }

    getGrammar(...args: any[]) {
      return this.#passThroughToQueryBuilder('getGrammar', args);
    }

    getProcessor(...args: any[]) {
      return this.#forwardCallToQueryBuilder('getProcessor', args);
    }

    getRawBindings(...args: any[]) {
      return this.#forwardCallToQueryBuilder('getRawBindings', args);
    }

    isQueryable(...args: any[]) {
      return this.#forwardCallToQueryBuilder('isQueryable', args);
    }

    newQuery(...args: any[]) {
      return this.#forwardCallToQueryBuilder('newQuery', args);
    }

    runSelect(...args: any[]) {
      return this.#forwardCallToQueryBuilder('runSelect', args);
    }

    selectRaw(...args: any[]) {
      return this.#forwardCallToQueryBuilder('selectRaw', args);
    }

    select(...args: any[]) {
      return this.#forwardCallToQueryBuilder('select', args);
    }

    update(...args: any[]) {
      return this.#directToQueryBuilder('update', args);
    }

    delete(...args: any[]) {
      return this.#directToBuilder('delete', args);
    }

    forceDelete(...args: any[]) {
      return this.#directToBuilder('forceDelete', args);
    }

    //
    // withoutGlobalScope(...args: any[]) {
    //   return this.#directToBuilder('withoutGlobalScope', args);
    // }

    truncate() {
      return this.#directToQueryBuilder('truncate', []);
    }

    async updateOrInsert(...args: any[]) {
      return this.#directToQueryBuilder('updateOrInsert', args);
    }

    async insert(...args: any[]) {
      return this.#passThroughToQueryBuilder('insert', args);
    }

    selectSub(...args: any[]) {
      return this.#forwardCallToQueryBuilder('selectSub', args);
    }

    lock(...args: any[]) {
      return this.#forwardCallToQueryBuilder('lock', args);
    }

    toSql(...args: any[]) {
      const _query = this.toBase();
      const result = _query.toSql.apply(_query, args);
      return {result, bindings: _query.getBindings()};
    }

    find(...args: any[]) {
      return this.#forwardCallToQueryBuilder('find', args);
    }

    // resetBindings(...args: any[]) {
    //   return this.#forwardCallToQueryBuilder('resetBindings', args);
    // }

    useReadConnection(...args: any[]) {
      return this.#forwardCallToQueryBuilder('useReadConnection', args);
    }

    useWriteConnection(...args: any[]) {
      return this.#forwardCallToQueryBuilder('useWriteConnection', args);
    }

    onceWithColumns(...args: any[]) {
      return this.#forwardCallToQueryBuilder('onceWithColumns', args);
    }

    join(...args: any[]) {
      return this.#forwardCallToQueryBuilder('join', args);
    }

    joinWhere(...args: any[]) {
      return this.#forwardCallToQueryBuilder('joinWhere', args);
    }

    joinSub(...args: any[]) {
      return this.#forwardCallToQueryBuilder('joinSub', args);
    }

    leftJoin(...args: any[]) {
      return this.#forwardCallToQueryBuilder('leftJoin', args);
    }

    leftJoinWhere(...args: any[]) {
      return this.#forwardCallToQueryBuilder('leftJoinWhere', args);
    }

    leftJoinSub(...args: any[]) {
      return this.#forwardCallToQueryBuilder('leftJoinSub', args);
    }

    rightJoin(...args: any[]) {
      return this.#forwardCallToQueryBuilder('rightJoin', args);
    }

    rightJoinWhere(...args: any[]) {
      return this.#forwardCallToQueryBuilder('rightJoinWhere', args);
    }

    rightJoinSub(...args: any[]) {
      return this.#forwardCallToQueryBuilder('rightJoinSub', args);
    }

    crossJoin(...args: any[]) {
      return this.#forwardCallToQueryBuilder('crossJoin', args);
    }

    oldest(...args: any[]) {
      return this.#forwardCallToQueryBuilder('oldest', args);
    }

    orderBy(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orderBy', args);
    }

    orderByDesc(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orderByDesc', args);
    }

    orderByRaw(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orderByRaw', args);
    }

    reorder(...args: any[]) {
      return this.#forwardCallToQueryBuilder('reorder', args);
    }

    groupBy(...args: any[]) {
      return this.#forwardCallToQueryBuilder('groupBy', args);
    }

    groupByRaw(...args: any[]) {
      return this.#forwardCallToQueryBuilder('groupByRaw', args);
    }

    addHaving(...args: any[]) {
      return this.#forwardCallToQueryBuilder('addHaving', args);
    }

    having(...args: any[]) {
      return this.#forwardCallToQueryBuilder('having', args);
    }

    havingBetween(...args: any[]) {
      return this.#forwardCallToQueryBuilder('havingBetween', args);
    }

    havingRaw(...args: any[]) {
      return this.#forwardCallToQueryBuilder('havingRaw', args);
    }

    orHaving(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orHaving', args);
    }

    orHavingRaw(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orHavingRaw', args);
    }

    limit(...args: any[]) {
      return this.#forwardCallToQueryBuilder('limit', args);
    }

    skip(...args: any[]) {
      return this.#forwardCallToQueryBuilder('skip', args);
    }

    offset(...args: any[]) {
      return this.#forwardCallToQueryBuilder('offset', args);
    }

    take(...args: any[]) {
      return this.#forwardCallToQueryBuilder('take', args);
    }

    forPage(...args: any[]) {
      return this.#forwardCallToQueryBuilder('forPage', args);
    }

    forPageBeforeId(...args: any[]) {
      return this.#forwardCallToQueryBuilder('forPageBeforeId', args);
    }

    forPageAfterId(...args: any[]) {
      return this.#forwardCallToQueryBuilder('forPageAfterId', args);
    }

    union(...args: any[]) {
      return this.#forwardCallToQueryBuilder('union', args);
    }

    unionAll(...args: any[]) {
      return this.#forwardCallToQueryBuilder('unionAll', args);
    }

    orWhereDate(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereDate', args);
    }

    orWhereDay(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereDay', args);
    }

    orWhereMonth(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereMonth', args);
    }

    orWhereTime(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereTime', args);
    }

    orWhereYear(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereYear', args);
    }

    whereDate(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereDate', args);
    }

    whereDay(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereDay', args);
    }

    whereMonth(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereMonth', args);
    }

    whereTime(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereTime', args);
    }

    whereYear(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereYear', args);
    }

    whereJsonContains(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereJsonContains', args);
    }

    orWhereJsonContains(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereJsonContains', args);
    }

    whereJsonDoesntContain(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereJsonDoesntContain', args);
    }

    orWhereJsonDoesntContain(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereJsonDoesntContain', args);
    }

    whereJsonLength(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereJsonLength', args);
    }

    orWhereJsonLength(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereJsonLength', args);
    }

    aggregate(...args: any[]) {
      return this.#forwardCallToQueryBuilder('aggregate', args);
    }

    count(...args: any[]) {
      return this.#passThroughToQueryBuilder('count', args);
    }

    doesntExist(...args: any[]) {
      return this.#forwardCallToQueryBuilder('doesntExist', args);
    }

    exists(...args: any[]) {
      return this.#forwardCallToQueryBuilder('exists', args);
    }

    getCountForPagination(...args: any[]) {
      return this.#forwardCallToQueryBuilder('getCountForPagination', args);
    }

    max(...args: any[]) {
      return this.#passThroughToQueryBuilder('max', args);
    }

    min(...args: any[]) {
      return this.#passThroughToQueryBuilder('min', args);
    }

    raw(...args: any[]) {
      return this.#passThroughToQueryBuilder('raw', args);
    }

    sum(...args: any[]) {
      return this.#passThroughToQueryBuilder('sum', args);
    }

    addWhereExistsQuery(...args: any[]) {
      return this.#forwardCallToQueryBuilder('addWhereExistsQuery', args);
    }

    orWhereBetween(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereBetween', args);
    }

    orWhereExists(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereExists', args);
    }

    orWhereIn(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereIn', args);
    }

    orWhereIntegerInRaw(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereIntegerInRaw', args);
    }

    orWhereIntegerNotInRaw(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereIntegerNotInRaw', args);
    }

    orWhereNotBetween(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereNotBetween', args);
    }

    orWhereNotExists(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereNotExists', args);
    }

    orWhereNotIn(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereNotIn', args);
    }

    orWhereNotNull(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereNotNull', args);
    }

    orWhereNull(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereNull', args);
    }

    where(...args: any[]) {
      return this.#forwardCallToQueryBuilder('where', args);
    }

    whereBetween(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereBetween', args);
    }

    whereExists(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereExists', args);
    }

    whereIn(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereIn', args);
    }

    whereIntegerInRaw(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereIntegerInRaw', args);
    }

    whereIntegerNotInRaw(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereIntegerNotInRaw', args);
    }

    whereNotBetween(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereNotBetween', args);
    }

    whereNotExists(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereNotExists', args);
    }

    whereNotIn(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereNotIn', args);
    }

    whereNotNull(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereNotNull', args);
    }

    whereNull(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereNull', args);
    }

    addNestedWhereQuery(...args: any[]) {
      return this.#forwardCallToQueryBuilder('addNestedWhereQuery', args);
    }

    addWhere(...args: any[]) {
      return this.#forwardCallToQueryBuilder('addWhere', args);
    }

    forNestedWhere(...args: any[]) {
      return this.#forwardCallToQueryBuilder('forNestedWhere', args);
    }

    orWhere(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhere', args);
    }

    orWhereColumn(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereColumn', args);
    }

    orWhereRaw(...args: any[]) {
      return this.#forwardCallToQueryBuilder('orWhereRaw', args);
    }

    // where(...args){return this.#forwardCallToQueryBuilder('where', args)}
    whereColumn(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereColumn', args);
    }

    whereNested(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereNested', args);
    }

    whereRaw(...args: any[]) {
      return this.#forwardCallToQueryBuilder('whereRaw', args);
    }

    chunk(...args: any[]) {
      return this.#forwardCallToQueryBuilder('chunk', args);
    }

    each(...args: any[]) {
      return this.#forwardCallToQueryBuilder('each', args);
    }

    chunkById(...args: any[]) {
      return this.#forwardCallToQueryBuilder('chunkById', args);
    }

    eachById(...args: any[]) {
      return this.#forwardCallToQueryBuilder('eachById', args);
    }

    first(...args: any[]) {
      return this.#forwardCallToQueryBuilder('first', args);
    }

    when(...args: any[]) {
      return this.#forwardCallToQueryBuilder('when', args);
    }

    tap(...args: any[]) {
      return this.#forwardCallToQueryBuilder('tap', args);
    }

    unless(...args: any[]) {
      return this.#forwardCallToQueryBuilder('unless', args);
    }

    pipe(...args: any[]) {
      return this.#forwardCallToQueryBuilder('pipe', args);
    }

    // region specify query builder
    beforeQuery(...args: any[]) {
      return this.#directToQueryBuilder('beforeQuery', args);
    }

    applyBeforeQueryCallbacks(...args: any[]) {
      return this.#directToQueryBuilder('applyBeforeQueryCallbacks', args);
    }

    //endregion
  };
}
