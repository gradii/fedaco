/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { __awaiter, __classPrivateFieldGet } from 'tslib'
export function mixinForwardCallToQueryBuilder(base) {
  var __Self_instances,
    __Self_passThroughToQueryBuilder,
    __Self_forwardCallToQueryBuilder,
    __Self_directToQueryBuilder,
    __Self_directToBuilder,
    _a
  return (
    (_a = class _Self extends base {
      constructor() {
        super(...arguments)
        __Self_instances.add(this)
      }
      average(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'average', args)
      }
      avg(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'avg', args)
      }
      pluck(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'pluck', args)
      }
      stripTableForPluck(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'stripTableForPluck', args)
      }
      pluckFromColumn(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'pluckFromColumn', args)
      }
      addBinding(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'addBinding', args)
      }
      addSelect(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'addSelect', args)
      }
      distinct(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_directToQueryBuilder
        ).call(this, 'distinct', args)
      }
      insertGetId(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_directToQueryBuilder
        ).call(this, 'insertGetId', args)
      }
      from(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'from', args)
      }
      fromSub(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'fromSub', args)
      }
      get(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_directToQueryBuilder
        ).call(this, 'get', args)
      }

      getConnection(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'getConnection', args)
      }
      insertUsing(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_directToQueryBuilder
        ).call(this, 'insertUsing', args)
      }
      insertOrIgnore(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_directToQueryBuilder
        ).call(this, 'insertOrIgnore', args)
      }
      getGrammar(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_passThroughToQueryBuilder
        ).call(this, 'getGrammar', args)
      }
      getProcessor(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'getProcessor', args)
      }
      getRawBindings(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'getRawBindings', args)
      }
      isQueryable(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'isQueryable', args)
      }
      newQuery(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'newQuery', args)
      }
      runSelect(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'runSelect', args)
      }
      selectRaw(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'selectRaw', args)
      }
      select(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'select', args)
      }
      update(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_directToQueryBuilder
        ).call(this, 'update', args)
      }
      delete(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_directToBuilder
        ).call(this, 'delete', args)
      }
      forceDelete(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_directToBuilder
        ).call(this, 'forceDelete', args)
      }

      truncate(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_directToQueryBuilder
        ).call(this, 'truncate', args)
      }
      updateOrInsert(...args) {
        return __awaiter(this, void 0, void 0, function* () {
          return __classPrivateFieldGet(
            this,
            __Self_instances,
            'm',
            __Self_directToQueryBuilder
          ).call(this, 'updateOrInsert', args)
        })
      }
      insert(...args) {
        return __awaiter(this, void 0, void 0, function* () {
          return __classPrivateFieldGet(
            this,
            __Self_instances,
            'm',
            __Self_passThroughToQueryBuilder
          ).call(this, 'insert', args)
        })
      }
      selectSub(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'selectSub', args)
      }
      lock(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'lock', args)
      }
      toSql(...args) {
        const _query = this.toBase()
        const result = _query.toSql.apply(_query, args)
        return { result, bindings: _query.getBindings() }
      }
      find(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'find', args)
      }

      useReadConnection(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'useReadConnection', args)
      }
      useWriteConnection(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'useWriteConnection', args)
      }
      onceWithColumns(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'onceWithColumns', args)
      }
      join(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'join', args)
      }
      joinWhere(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'joinWhere', args)
      }
      joinSub(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'joinSub', args)
      }
      leftJoin(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'leftJoin', args)
      }
      leftJoinWhere(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'leftJoinWhere', args)
      }
      leftJoinSub(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'leftJoinSub', args)
      }
      rightJoin(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'rightJoin', args)
      }
      rightJoinWhere(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'rightJoinWhere', args)
      }
      rightJoinSub(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'rightJoinSub', args)
      }
      crossJoin(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'crossJoin', args)
      }
      oldest(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'oldest', args)
      }
      orderBy(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orderBy', args)
      }
      orderByDesc(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orderByDesc', args)
      }
      orderByRaw(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orderByRaw', args)
      }
      reorder(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'reorder', args)
      }
      groupBy(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'groupBy', args)
      }
      groupByRaw(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'groupByRaw', args)
      }
      addHaving(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'addHaving', args)
      }
      having(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'having', args)
      }
      havingBetween(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'havingBetween', args)
      }
      havingRaw(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'havingRaw', args)
      }
      orHaving(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orHaving', args)
      }
      orHavingRaw(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orHavingRaw', args)
      }
      limit(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'limit', args)
      }
      skip(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'skip', args)
      }
      offset(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'offset', args)
      }
      take(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'take', args)
      }
      forPage(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'forPage', args)
      }
      forPageBeforeId(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'forPageBeforeId', args)
      }
      forPageAfterId(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'forPageAfterId', args)
      }
      union(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'union', args)
      }
      unionAll(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'unionAll', args)
      }
      orWhereDate(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereDate', args)
      }
      orWhereDay(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereDay', args)
      }
      orWhereMonth(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereMonth', args)
      }
      orWhereTime(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereTime', args)
      }
      orWhereYear(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereYear', args)
      }
      whereDate(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereDate', args)
      }
      whereDay(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereDay', args)
      }
      whereMonth(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereMonth', args)
      }
      whereTime(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereTime', args)
      }
      whereYear(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereYear', args)
      }
      aggregate(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'aggregate', args)
      }
      count(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_passThroughToQueryBuilder
        ).call(this, 'count', args)
      }
      doesntExist(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'doesntExist', args)
      }
      exists(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'exists', args)
      }
      getCountForPagination(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'getCountForPagination', args)
      }
      max(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_passThroughToQueryBuilder
        ).call(this, 'max', args)
      }
      min(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_passThroughToQueryBuilder
        ).call(this, 'min', args)
      }
      raw(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_passThroughToQueryBuilder
        ).call(this, 'raw', args)
      }
      sum(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_passThroughToQueryBuilder
        ).call(this, 'sum', args)
      }
      addWhereExistsQuery(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'addWhereExistsQuery', args)
      }
      orWhereBetween(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereBetween', args)
      }
      orWhereExists(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereExists', args)
      }
      orWhereIn(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereIn', args)
      }
      orWhereIntegerInRaw(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereIntegerInRaw', args)
      }
      orWhereIntegerNotInRaw(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereIntegerNotInRaw', args)
      }
      orWhereNotBetween(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereNotBetween', args)
      }
      orWhereNotExists(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereNotExists', args)
      }
      orWhereNotIn(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereNotIn', args)
      }
      orWhereNotNull(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereNotNull', args)
      }
      orWhereNull(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereNull', args)
      }
      where(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'where', args)
      }
      whereBetween(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereBetween', args)
      }
      whereExists(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereExists', args)
      }
      whereIn(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereIn', args)
      }
      whereIntegerInRaw(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereIntegerInRaw', args)
      }
      whereIntegerNotInRaw(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereIntegerNotInRaw', args)
      }
      whereNotBetween(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereNotBetween', args)
      }
      whereNotExists(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereNotExists', args)
      }
      whereNotIn(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereNotIn', args)
      }
      whereNotNull(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereNotNull', args)
      }
      whereNull(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereNull', args)
      }
      addNestedWhereQuery(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'addNestedWhereQuery', args)
      }
      addWhere(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'addWhere', args)
      }
      forNestedWhere(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'forNestedWhere', args)
      }
      orWhere(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhere', args)
      }
      orWhereColumn(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereColumn', args)
      }
      orWhereRaw(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'orWhereRaw', args)
      }

      whereColumn(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereColumn', args)
      }
      whereNested(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereNested', args)
      }
      whereRaw(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'whereRaw', args)
      }
      chunk(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'chunk', args)
      }
      each(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'each', args)
      }
      chunkById(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'chunkById', args)
      }
      eachById(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'eachById', args)
      }
      first(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'first', args)
      }
      when(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'when', args)
      }
      tap(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'tap', args)
      }
      unless(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'unless', args)
      }
      pipe(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_forwardCallToQueryBuilder
        ).call(this, 'pipe', args)
      }

      beforeQuery(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_directToQueryBuilder
        ).call(this, 'beforeQuery', args)
      }
      applyBeforeQueryCallbacks(...args) {
        return __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self_directToQueryBuilder
        ).call(this, 'applyBeforeQueryCallbacks', args)
      }
    }),
    (__Self_instances = new WeakSet()),
    (__Self_passThroughToQueryBuilder =
      function __Self_passThroughToQueryBuilder(method, parameters) {
        const _query = this.toBase()
        const result = _query[method].apply(_query, parameters)
        if (result === _query) {
          return this
        }
        return result
      }),
    (__Self_forwardCallToQueryBuilder =
      function __Self_forwardCallToQueryBuilder(method, parameters) {
        const result = this._query[method].apply(this._query, parameters)
        if (result === this._query) {
          return this
        }
        return result
      }),
    (__Self_directToQueryBuilder = function __Self_directToQueryBuilder(
      method,
      parameters
    ) {
      const _query = this.toBase()
      return _query[method].apply(_query, parameters)
    }),
    (__Self_directToBuilder = function __Self_directToBuilder(
      method,
      parameters
    ) {
      return this._query[method](...parameters)
    }),
    _a
  )
}
