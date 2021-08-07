import { Constructor } from '../../helper/constructor';
import { QueryBuilder } from '../../query-builder/query-builder';

type ExcludeMethod = 'find' | 'where' | 'get'

export type ForwardCallToQueryBuilderCtor = Constructor<Omit<QueryBuilder, ExcludeMethod>>;


export function mixinForwardCallToQueryBuilder<T extends Constructor<any>>(base: T): ForwardCallToQueryBuilderCtor & T {

  return class _Self extends base {

    // find(...args){return this._query.find(...args)}
    pluck(...args){return this._query.pluck(...args)}
    stripTableForPluck(...args){return this._query.stripTableForPluck(...args)}
    pluckFromColumn(...args){return this._query.pluckFromColumn(...args)}
    addBinding(...args){return this._query.addBinding(...args)}
    addSelect(...args){return this._query.addSelect(...args)}
    distinct(...args){return this._query.distinct(...args)}
    insertGetId(...args){return this._query.insertGetId(...args)}
    from(...args){return this._query.from(...args)}
    fromSub(...args){return this._query.fromSub(...args)}
    get(...args){return this._query.get(...args)}
    getBindings(...args){return this._query.getBindings(...args)}
    getConnection(...args){return this._query.getConnection(...args)}
    insertUsing(...args){return this._query.insertUsing(...args)}
    insertOrIgnore(...args){return this._query.insertOrIgnore(...args)}
    getGrammar(...args){return this._query.getGrammar(...args)}
    getProcessor(...args){return this._query.getProcessor(...args)}
    getRawBindings(...args){return this._query.getRawBindings(...args)}
    isQueryable(...args){return this._query.isQueryable(...args)}
    newQuery(...args){return this._query.newQuery(...args)}
    runSelect(...args){return this._query.runSelect(...args)}
    selectRaw(...args){return this._query.selectRaw(...args)}
    select(...args){return this._query.select(...args)}
    update(...args){return this._query.update(...args)}
    delete(...args){return this._query.delete(...args)}
    truncate(...args){return this._query.truncate(...args)}
    updateOrInsert(...args){return this._query.updateOrInsert(...args)}
    insert(...args){return this._query.insert(...args)}
    selectSub(...args){return this._query.selectSub(...args)}
    lock(...args){return this._query.lock(...args)}
    toSql(...args){return this._query.toSql(...args)}
    resetBindings(...args){return this._query.resetBindings(...args)}
    useReadConnection(...args){return this._query.useReadConnection(...args)}
    useWriteConnection(...args){return this._query.useWriteConnection(...args)}
    onceWithColumns(...args){return this._query.onceWithColumns(...args)}
    join(...args){return this._query.join(...args)}
    joinWhere(...args){return this._query.joinWhere(...args)}
    joinSub(...args){return this._query.joinSub(...args)}
    leftJoin(...args){return this._query.leftJoin(...args)}
    leftJoinWhere(...args){return this._query.leftJoinWhere(...args)}
    leftJoinSub(...args){return this._query.leftJoinSub(...args)}
    rightJoin(...args){return this._query.rightJoin(...args)}
    rightJoinWhere(...args){return this._query.rightJoinWhere(...args)}
    rightJoinSub(...args){return this._query.rightJoinSub(...args)}
    crossJoin(...args){return this._query.crossJoin(...args)}
    oldest(...args){return this._query.oldest(...args)}
    orderBy(...args){return this._query.orderBy(...args)}
    orderByDesc(...args){return this._query.orderByDesc(...args)}
    orderByRaw(...args){return this._query.orderByRaw(...args)}
    reorder(...args){return this._query.reorder(...args)}
    groupBy(...args){return this._query.groupBy(...args)}
    groupByRaw(...args){return this._query.groupByRaw(...args)}
    addHaving(...args){return this._query.addHaving(...args)}
    having(...args){return this._query.having(...args)}
    havingBetween(...args){return this._query.havingBetween(...args)}
    havingRaw(...args){return this._query.havingRaw(...args)}
    orHaving(...args){return this._query.orHaving(...args)}
    orHavingRaw(...args){return this._query.orHavingRaw(...args)}
    limit(...args){return this._query.limit(...args)}
    skip(...args){return this._query.skip(...args)}
    offset(...args){return this._query.offset(...args)}
    take(...args){return this._query.take(...args)}
    forPage(...args){return this._query.forPage(...args)}
    union(...args){return this._query.union(...args)}
    unionAll(...args){return this._query.unionAll(...args)}
    orWhereDate(...args){return this._query.orWhereDate(...args)}
    orWhereDay(...args){return this._query.orWhereDay(...args)}
    orWhereMonth(...args){return this._query.orWhereMonth(...args)}
    orWhereTime(...args){return this._query.orWhereTime(...args)}
    orWhereYear(...args){return this._query.orWhereYear(...args)}
    whereDate(...args){return this._query.whereDate(...args)}
    whereDay(...args){return this._query.whereDay(...args)}
    whereMonth(...args){return this._query.whereMonth(...args)}
    whereTime(...args){return this._query.whereTime(...args)}
    whereYear(...args){return this._query.whereYear(...args)}
    aggregate(...args){return this._query.aggregate(...args)}
    count(...args){return this._query.count(...args)}
    doesntExist(...args){return this._query.doesntExist(...args)}
    exists(...args){return this._query.exists(...args)}
    getCountForPagination(...args){return this._query.getCountForPagination(...args)}
    max(...args){return this._query.max(...args)}
    min(...args){return this._query.min(...args)}
    sum(...args){return this._query.sum(...args)}
    addWhereExistsQuery(...args){return this._query.addWhereExistsQuery(...args)}
    orWhereBetween(...args){return this._query.orWhereBetween(...args)}
    orWhereExists(...args){return this._query.orWhereExists(...args)}
    orWhereIn(...args){return this._query.orWhereIn(...args)}
    orWhereIntegerInRaw(...args){return this._query.orWhereIntegerInRaw(...args)}
    orWhereIntegerNotInRaw(...args){return this._query.orWhereIntegerNotInRaw(...args)}
    orWhereNotBetween(...args){return this._query.orWhereNotBetween(...args)}
    orWhereNotExists(...args){return this._query.orWhereNotExists(...args)}
    orWhereNotIn(...args){return this._query.orWhereNotIn(...args)}
    orWhereNotNull(...args){return this._query.orWhereNotNull(...args)}
    orWhereNull(...args){return this._query.orWhereNull(...args)}
    whereBetween(...args){return this._query.whereBetween(...args)}
    whereExists(...args){return this._query.whereExists(...args)}
    whereIn(...args){return this._query.whereIn(...args)}
    whereIntegerInRaw(...args){return this._query.whereIntegerInRaw(...args)}
    whereIntegerNotInRaw(...args){return this._query.whereIntegerNotInRaw(...args)}
    whereNotBetween(...args){return this._query.whereNotBetween(...args)}
    whereNotExists(...args){return this._query.whereNotExists(...args)}
    whereNotIn(...args){return this._query.whereNotIn(...args)}
    whereNotNull(...args){return this._query.whereNotNull(...args)}
    whereNull(...args){return this._query.whereNull(...args)}
    addNestedWhereQuery(...args){return this._query.addNestedWhereQuery(...args)}
    addWhere(...args){return this._query.addWhere(...args)}
    forNestedWhere(...args){return this._query.forNestedWhere(...args)}
    orWhere(...args){return this._query.orWhere(...args)}
    orWhereColumn(...args){return this._query.orWhereColumn(...args)}
    orWhereRaw(...args){return this._query.orWhereRaw(...args)}
    // where(...args){return this._query.where(...args)}
    whereColumn(...args){return this._query.whereColumn(...args)}
    whereNested(...args){return this._query.whereNested(...args)}
    whereRaw(...args){return this._query.whereRaw(...args)}
    when(...args){return this._query.when(...args)}
    tap(...args){return this._query.tap(...args)}
    first(...args){return this._query.first(...args)}
    unless(...args){return this._query.unless(...args)}
  };
}
