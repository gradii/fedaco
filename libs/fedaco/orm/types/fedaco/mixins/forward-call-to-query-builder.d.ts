/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { ConnectionInterface } from '../../query-builder/connection-interface';
import { QueryBuilderAggregate } from '../../query-builder/mixins/aggregate';
import { BuildQueries } from '../../query-builder/mixins/build-query';
import { QueryBuilderGroupBy } from '../../query-builder/mixins/group-by';
import { QueryBuilderHaving } from '../../query-builder/mixins/having';
import { QueryBuilderJoin } from '../../query-builder/mixins/join';
import { QueryBuilderLimitOffset } from '../../query-builder/mixins/limit-offset';
import { QueryBuilderOrderBy } from '../../query-builder/mixins/order-by';
import { QueryBuilderUnion } from '../../query-builder/mixins/union';
import { QueryBuilderWhereCommon } from '../../query-builder/mixins/where-common';
import { QueryBuilderWhereDate } from '../../query-builder/mixins/where-date';
import { QueryBuilderWherePredicate } from '../../query-builder/mixins/where-predicate';
import {
    JoinClauseBuilder,
    QueryBuilder
} from '../../query-builder/query-builder';
import { FedacoBuilder } from '../fedaco-builder';
export interface ForwardCallToQueryBuilder
    extends Omit<QueryBuilderJoin, 'joinSub'>,
        QueryBuilderOrderBy,
        QueryBuilderGroupBy,
        QueryBuilderHaving,
        QueryBuilderLimitOffset,
        QueryBuilderUnion,
        QueryBuilderWhereDate,
        QueryBuilderAggregate,
        QueryBuilderWherePredicate,
        QueryBuilderWhereCommon,
        Constructor<Omit<BuildQueries, 'first'>>,
        Pick<
            QueryBuilder,
            'beforeQuery' | 'find' | 'applyBeforeQueryCallbacks'
        > {
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
    truncate(...args: any[]): this;
    updateOrInsert(...args: any[]): this;
    insert(...args: any[]): Promise<any>;
    selectSub(...args: any[]): this;
    lock(...args: any[]): this;
    toSql(...args: any[]): {
        result: string;
        bindings: any[];
    };
    find(...args: any[]): Promise<any | any[]>;
    resetBindings(...args: any[]): this;
    useReadConnection(...args: any[]): this;
    useWriteConnection(...args: any[]): this;
    onceWithColumns(...args: any[]): this;
    first(...args: any[]): Promise<any>;
    join(...args: any[]): this;
    joinSub(
        query: Function | QueryBuilder | FedacoBuilder | string,
        as: string,
        first: ((join: JoinClauseBuilder) => any) | string,
        operator?: string,
        second?: string | number,
        type?: string,
        where?: boolean
    ): this;
    pipe(...args: any[]): this;
}
export declare type ForwardCallToQueryBuilderCtor =
    Constructor<ForwardCallToQueryBuilder>;
export declare function mixinForwardCallToQueryBuilder<
    T extends Constructor<any>
>(base: T): ForwardCallToQueryBuilderCtor & T;
