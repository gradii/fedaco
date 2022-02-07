import { __awaiter } from 'tslib'
import { isArray, isBlank, isObject } from '@gradii/check-type'
import { uniq } from 'ramda'
import { tap } from 'rxjs/operators'
import { pluralStudy } from '../../helper/pluralize'
import { camelCase } from '../../helper/str'
import { mixinInteractsWithDictionary } from './concerns/interacts-with-dictionary'
import { mixinInteractsWithPivotTable } from './concerns/interacts-with-pivot-table'
import { Relation } from './relation'
export class BelongsToMany extends mixinInteractsWithDictionary(
  mixinInteractsWithPivotTable(Relation)
) {
  constructor(
    query,
    parent,
    table,
    foreignPivotKey,
    relatedPivotKey,
    parentKey,
    relatedKey,
    relationName = null
  ) {
    super(query, parent)

    this._pivotColumns = []

    this._pivotWheres = []

    this._pivotWhereIns = []

    this._pivotWhereNulls = []

    this._pivotValues = []

    this._withTimestamps = false

    this._accessor = 'pivot'
    this._parentKey = parentKey
    this._relatedKey = relatedKey
    this._relationName = relationName
    this._relatedPivotKey = relatedPivotKey
    this._foreignPivotKey = foreignPivotKey
    this._table = table
    this.addConstraints()
  }

  addConstraints() {
    this._performJoin()
    if (BelongsToMany.constraints) {
      this._addWhereConstraints()
    }
  }

  _performJoin(query = null) {
    query = query || this._query
    query.join(
      this._table,
      this.getQualifiedRelatedKeyName(),
      '=',
      this.getQualifiedRelatedPivotKeyName()
    )
    return this
  }

  _addWhereConstraints() {
    this._query.where(
      this.getQualifiedForeignPivotKeyName(),
      '=',
      this._parent[this._parentKey]
    )
    return this
  }

  addEagerConstraints(models) {
    const whereIn = this._whereInMethod(this._parent, this._parentKey)
    this._query[whereIn](
      this.getQualifiedForeignPivotKeyName(),
      this.getKeys(models, this._parentKey)
    )
  }

  initRelation(models, relation) {
    for (const model of models) {
      model.setRelation(relation, this._related.newCollection())
    }
    return models
  }

  match(models, results, relation) {
    const dictionary = this._buildDictionary(results)
    for (const model of models) {
      const key = this._getDictionaryKey(model[this._parentKey])
      if (dictionary[key] !== undefined) {
        model.setRelation(
          relation,
          this._related.newCollection(dictionary[key])
        )
      }
    }
    return models
  }

  _buildDictionary(results) {
    const dictionary = {}
    for (const result of results) {
      const value = this._getDictionaryKey(
        result
          .getRelation(this._accessor)
          .getAttributeValue(this._foreignPivotKey)
      )
      if (!isArray(dictionary[value])) {
        dictionary[value] = []
      }
      dictionary[value].push(result)
    }
    return dictionary
  }

  using(clazz) {
    this._using = clazz
    return this
  }

  as(accessor) {
    this._accessor = accessor
    return this
  }
  wherePivot(column, operator, value, conjunction = 'and') {
    if (arguments.length === 2) {
      value = operator
      operator = '='
    }
    this._pivotWheres.push(arguments)
    return this.getQuery().where(
      this.qualifyPivotColumn(column),
      operator,
      value,
      conjunction
    )
  }

  wherePivotBetween(column, values, conjunction = 'and', not = false) {
    return this.getQuery().whereBetween(
      this.qualifyPivotColumn(column),
      values,
      conjunction,
      not
    )
  }

  orWherePivotBetween(column, values) {
    return this.wherePivotBetween(column, values, 'or')
  }

  wherePivotNotBetween(column, values, conjunction = 'and') {
    return this.wherePivotBetween(column, values, conjunction, true)
  }

  orWherePivotNotBetween(column, values) {
    return this.wherePivotBetween(column, values, 'or', true)
  }

  wherePivotIn(column, values, conjunction = 'and', not = false) {
    this._pivotWhereIns.push(arguments)
    return this.whereIn(
      this.qualifyPivotColumn(column),
      values,
      conjunction,
      not
    )
  }

  orWherePivot(column, operator = null, value = null) {
    return this.wherePivot(column, operator, value, 'or')
  }

  withPivotValue(column, value = null) {
    if (isObject(column)) {
      for (const [name, val] of Object.entries(column)) {
        this.withPivotValue(name, val)
      }
      return this
    }
    if (isBlank(value)) {
      throw new Error(
        'InvalidArgumentException The provided value may not be null.'
      )
    }
    this._pivotValues.push({ column, value })
    return this.wherePivot(column, '=', value)
  }

  orWherePivotIn(column, values) {
    return this.wherePivotIn(column, values, 'or')
  }

  wherePivotNotIn(column, values, conjunction = 'and') {
    return this.wherePivotIn(column, values, conjunction, true)
  }

  orWherePivotNotIn(column, values) {
    return this.wherePivotNotIn(column, values, 'or')
  }

  wherePivotNull(column, conjunction = 'and', not = false) {
    this._pivotWhereNulls.push(arguments)
    return this.whereNull(this.qualifyPivotColumn(column), conjunction, not)
  }

  wherePivotNotNull(column, conjunction = 'and') {
    return this.wherePivotNull(column, conjunction, true)
  }

  orWherePivotNull(column, not = false) {
    return this.wherePivotNull(column, 'or', not)
  }

  orWherePivotNotNull(column) {
    return this.orWherePivotNull(column, true)
  }

  orderByPivot(column, direction = 'asc') {
    return this.orderBy(this.qualifyPivotColumn(column), direction)
  }

  findOrNew(id, columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      let instance = yield this.find(id, columns)
      if (isBlank(instance)) {
        instance = this._related.newInstance()
      }
      return instance
    })
  }

  firstOrNew(attributes = {}, values = []) {
    return __awaiter(this, void 0, void 0, function* () {
      let instance = yield this._related.newQuery().where(attributes).first()
      if (isBlank(instance)) {
        instance = this._related.newInstance([...attributes, ...values])
      }
      return instance
    })
  }

  firstOrCreate(attributes = {}, values = {}, joining = [], touch = true) {
    return __awaiter(this, void 0, void 0, function* () {
      let instance = yield this._related.newQuery().where(attributes).first()
      if (isBlank(instance)) {
        instance = yield this.create(
          Object.assign(Object.assign({}, attributes), values),
          joining,
          touch
        )
      }
      return instance
    })
  }

  updateOrCreate(attributes, values = [], joining = [], touch = true) {
    return __awaiter(this, void 0, void 0, function* () {
      const instance = yield this._related.newQuery().where(attributes).first()
      if (isBlank(instance)) {
        return this.create([...attributes, ...values], joining, touch)
      }
      instance.fill(values)
      yield instance.save({
        touch: false,
      })
      return instance
    })
  }

  find(id, columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      if (isArray(id)) {
        return this.findMany(id, columns)
      }
      return this.where(
        this.getRelated().getQualifiedKeyName(),
        '=',
        this._parseIds(id)
      ).first(columns)
    })
  }

  findMany(ids, columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!ids.length) {
        return this.getRelated().newCollection()
      }
      return this.whereIn(
        this.getRelated().getQualifiedKeyName(),
        this._parseIds(ids)
      ).get(columns)
    })
  }

  findOrFail(id, columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      const result = yield this.find(id, columns)

      if (isArray(id)) {
        if (result.length === uniq(id).length) {
          return result
        }
      } else if (!isBlank(result)) {
        return result
      }
      throw new Error(
        `ModelNotFoundException().setModel(get_class(this._related), id);`
      )
    })
  }

  firstWhere(column, operator = null, value = null, conjunction = 'and') {
    return this.where(column, operator, value, conjunction).first()
  }

  first(columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      const results = yield this.take(1).get(columns)
      return results.length > 0 ? results[0] : null
    })
  }

  firstOrFail(columns = ['*']) {
    const model = this.first(columns)
    if (!isBlank(model)) {
      return model
    }
    throw new Error(
      `ModelNotFoundException().setModel(get_class(this._related))`
    )
  }

  getResults() {
    return __awaiter(this, void 0, void 0, function* () {
      return !isBlank(this._parent[this._parentKey])
        ? yield this.get()
        : this._related.newCollection()
    })
  }

  get(columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      const builder = this._query.applyScopes()
      columns = builder.getQuery()._columns.length ? [] : columns
      let models = yield builder
        .addSelect(this._shouldSelect(columns))
        .getModels()
      this._hydratePivotRelation(models)
      if (models.length > 0) {
        models = yield builder.eagerLoadRelations(models)
      }
      return this._related.newCollection(models)
    })
  }

  _shouldSelect(columns = ['*']) {
    if (columns == ['*']) {
      columns = [`${this._related.getTable()}.*`]
    }
    return [...columns, ...this._aliasedPivotColumns()]
  }

  _aliasedPivotColumns() {
    const defaults = [this._foreignPivotKey, this._relatedPivotKey]
    return uniq(
      [...defaults, ...this._pivotColumns].map((column) => {
        return this.qualifyPivotColumn(column) + ' as pivot_' + column
      })
    )
  }

  paginate(page = 1, pageSize, columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      this._prepareQueryBuilder()
      const results = yield this._query.paginate(page, pageSize, columns)
      this._hydratePivotRelation(results.items)
      return results
    })
  }

  chunk(count, signal) {
    this._prepareQueryBuilder()
    return this._query.chunk(count).pipe(
      tap(({ results, page }) => {
        this._hydratePivotRelation(results)
      })
    )
  }

  chunkById(count, column, alias, signal) {
    this._prepareQueryBuilder()
    column =
      column !== null && column !== void 0
        ? column
        : this.getRelated().qualifyColumn(this.getRelatedKeyName())
    alias =
      alias !== null && alias !== void 0 ? alias : this.getRelatedKeyName()
    return this._query.chunkById(count, column, alias).pipe(
      tap(({ results }) => {
        this._hydratePivotRelation(results)
      })
    )
  }

  each(count = 1000, signal) {
    return this._prepareQueryBuilder()
      .each(count, signal)
      .pipe(
        tap(({ item, index }) => {
          this._hydratePivotRelation([item])
        })
      )
  }

  _prepareQueryBuilder() {
    return this._query.addSelect(this._shouldSelect())
  }

  _hydratePivotRelation(models) {
    for (const model of models) {
      model.setRelation(
        this._accessor,
        this.newExistingPivot(this._migratePivotAttributes(model))
      )
    }
  }

  _migratePivotAttributes(model) {
    const values = {}
    for (const [key, value] of Object.entries(model.getAttributes())) {
      if (key.startsWith('pivot_')) {
        values[key.substr(6)] = value
        delete model.key
      }
    }
    return values
  }

  touchIfTouching() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this._touchingParent()) {
        yield this.getParent().touch()
      }
      if (this.getParent().touches(this._relationName)) {
        yield this.touch()
      }
    })
  }

  _touchingParent() {
    return this.getRelated().touches(this._guessInverseRelation())
  }

  _guessInverseRelation() {
    return camelCase(pluralStudy(this.getParent().constructor.name))
  }

  touch() {
    return __awaiter(this, void 0, void 0, function* () {
      const key = this.getRelated().getKeyName()
      const columns = {
        [this._related.getUpdatedAtColumn()]:
          this._related.freshTimestampString(),
      }
      const ids = yield this.allRelatedIds()
      if (ids.length > 0) {
        yield this.getRelated()
          .newQueryWithoutRelationships()
          .whereIn(key, ids)
          .update(columns)
      }
    })
  }

  allRelatedIds() {
    return this.newPivotQuery().pluck(this._relatedPivotKey)
  }

  save(model, pivotAttributes = [], touch = true) {
    model.save({
      touch: false,
    })
    this.attach(model, pivotAttributes, touch)
    return model
  }

  saveMany(models, pivotAttributes = {}) {
    var _a
    for (const [key, model] of Object.entries(models)) {
      this.save(
        model,
        (_a = pivotAttributes[key]) !== null && _a !== void 0 ? _a : [],
        false
      )
    }
    this.touchIfTouching()
    return models
  }

  create(attributes = {}, joining = [], touch = true) {
    return __awaiter(this, void 0, void 0, function* () {
      const instance = this._related.newInstance(attributes)
      yield instance.save({
        touch: false,
      })
      this.attach(instance, joining, touch)
      return instance
    })
  }

  createMany(records, joinings = {}) {
    var _a
    const instances = []
    for (const [key, record] of Object.entries(records)) {
      instances.push(
        this.create(
          record,
          (_a = joinings[key]) !== null && _a !== void 0 ? _a : [],
          false
        )
      )
    }
    this.touchIfTouching()
    return instances
  }

  getRelationExistenceQuery(query, parentQuery, columns = ['*']) {
    if (parentQuery.getQuery().from == query.getQuery().from) {
      return this.getRelationExistenceQueryForSelfJoin(
        query,
        parentQuery,
        columns
      )
    }
    this._performJoin(query)
    return super.getRelationExistenceQuery(query, parentQuery, columns)
  }

  getRelationExistenceQueryForSelfJoin(query, parentQuery, columns = ['*']) {
    query.select(columns)
    const hash = this.getRelationCountHash()
    query.from(`${this._related.getTable()} as ${hash}`)
    this._related.setTable(hash)
    this._performJoin(query)
    return super.getRelationExistenceQuery(query, parentQuery, columns)
  }

  getExistenceCompareKey() {
    return this.getQualifiedForeignPivotKeyName()
  }

  withTimestamps(createdAt = null, updatedAt = null) {
    this._withTimestamps = true
    this._pivotCreatedAt = createdAt
    this._pivotUpdatedAt = updatedAt
    return this.withPivot(this.createdAt(), this.updatedAt())
  }

  createdAt() {
    return this._pivotCreatedAt || this._parent.getCreatedAtColumn()
  }

  updatedAt() {
    return this._pivotUpdatedAt || this._parent.getUpdatedAtColumn()
  }

  getForeignPivotKeyName() {
    return this._foreignPivotKey
  }

  getQualifiedForeignPivotKeyName() {
    return this.qualifyPivotColumn(this._foreignPivotKey)
  }

  getRelatedPivotKeyName() {
    return this._relatedPivotKey
  }

  getQualifiedRelatedPivotKeyName() {
    return this.qualifyPivotColumn(this._relatedPivotKey)
  }

  getParentKeyName() {
    return this._parentKey
  }

  getQualifiedParentKeyName() {
    return this._parent.qualifyColumn(this._parentKey)
  }

  getRelatedKeyName() {
    return this._relatedKey
  }

  getQualifiedRelatedKeyName() {
    return this._related.qualifyColumn(this._relatedKey)
  }

  getTable() {
    return this._table
  }

  getRelationName() {
    return this._relationName
  }

  getPivotAccessor() {
    return this._accessor
  }

  getPivotColumns() {
    return this._pivotColumns
  }

  qualifyPivotColumn(column) {
    return column.includes('.') ? column : `${this._table}.${column}`
  }
}

Relation.BelongsToMany = BelongsToMany
