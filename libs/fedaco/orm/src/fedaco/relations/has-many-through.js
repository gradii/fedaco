import { __awaiter } from 'tslib'

import { isArray, isBlank } from '@gradii/check-type'
import { uniq } from 'ramda'
import { mixinInteractsWithDictionary } from './concerns/interacts-with-dictionary'
import { Relation } from './relation'
export class HasManyThrough extends mixinInteractsWithDictionary(Relation) {
  constructor(
    query,
    farParent,
    throughParent,
    firstKey,
    secondKey,
    localKey,
    secondLocalKey
  ) {
    super(query, throughParent)
    this._localKey = localKey
    this._firstKey = firstKey
    this._secondKey = secondKey
    this._farParent = farParent
    this._throughParent = throughParent
    this._secondLocalKey = secondLocalKey
    this.addConstraints()
  }

  addConstraints() {
    const localValue = this._farParent.getAttribute(this._localKey)
    this._performJoin()
    if (HasManyThrough.constraints) {
      this._query.where(this.getQualifiedFirstKeyName(), '=', localValue)
    }
  }

  _performJoin(query = null) {
    query = query || this._query
    const farKey = this.getQualifiedFarKeyName()
    query.join(
      this._throughParent.getTable(),
      this.getQualifiedParentKeyName(),
      '=',
      farKey
    )
    if (this.throughParentSoftDeletes()) {
      query.withGlobalScope('SoftDeletableHasManyThrough', (q) => {
        q.whereNull(this._throughParent.getQualifiedDeletedAtColumn())
      })
    }
  }

  getQualifiedParentKeyName() {
    return this._parent.qualifyColumn(this._secondLocalKey)
  }

  throughParentSoftDeletes() {
    return this._throughParent.isTypeofSoftDeletes
  }

  withTrashedParents() {
    this._query.withoutGlobalScope('SoftDeletableHasManyThrough')
    return this
  }

  addEagerConstraints(models) {
    const whereIn = this._whereInMethod(this._farParent, this._localKey)
    this._query[whereIn](
      this.getQualifiedFirstKeyName(),
      this.getKeys(models, this._localKey)
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
      const key = this._getDictionaryKey(model.getAttribute(this._localKey))
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
      if (!dictionary[result.getAttribute('fedaco_through_key')]) {
        dictionary[result.getAttribute('fedaco_through_key')] = []
      }
      dictionary[result.getAttribute('fedaco_through_key')].push(result)
    }
    return dictionary
  }

  firstOrNew(attributes) {
    return __awaiter(this, void 0, void 0, function* () {
      let instance = yield this.where(attributes).first()
      if (isBlank(instance)) {
        instance = this._related.newInstance(attributes)
      }
      return instance
    })
  }

  updateOrCreate(attributes, values = []) {
    return __awaiter(this, void 0, void 0, function* () {
      const instance = yield this.firstOrNew(attributes)
      yield instance.fill(values).save()
      return instance
    })
  }

  firstWhere(column, operator = null, value = null, conjunction = 'and') {
    return __awaiter(this, void 0, void 0, function* () {
      return this.where(column, operator, value, conjunction).first()
    })
  }

  first(columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      const results = yield this.take(1).get(columns)
      return results.length > 0 ? results[0] : null
    })
  }

  firstOrFail(columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      const model = yield this.first(columns)
      if (!isBlank(model)) {
        return model
      }
      throw new Error(
        `ModelNotFoundException No query results for model [${this._related.constructor.name}].`
      )
    })
  }

  find(id, columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      if (isArray(id)) {
        return this.findMany(id, columns)
      }
      return yield this.where(
        this.getRelated().getQualifiedKeyName(),
        '=',
        id
      ).first(columns)
    })
  }

  findMany(ids, columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!ids.length) {
        return this.getRelated().newCollection()
      }
      return yield this.whereIn(
        this.getRelated().getQualifiedKeyName(),
        ids
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
        `ModelNotFoundException No query results for model [${this._related.constructor.name}] [${id}]`
      )
    })
  }

  getResults() {
    return __awaiter(this, void 0, void 0, function* () {
      return !isBlank(this._farParent.getAttribute(this._localKey))
        ? yield this.get()
        : this._related.newCollection()
    })
  }

  get(columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      const builder = this._prepareQueryBuilder(columns)
      let models = yield builder.getModels()
      if (models.length > 0) {
        models = yield builder.eagerLoadRelations(models)
      }
      return this._related.newCollection(models)
    })
  }

  _shouldSelect(columns = ['*']) {
    if (columns.includes('*')) {
      columns = [this._related.getTable() + '.*']
    }
    return [
      ...columns,
      ...[this.getQualifiedFirstKeyName() + ' as fedaco_through_key'],
    ]
  }

  chunk(count, singal) {
    return this._prepareQueryBuilder().chunk(count, singal)
  }

  chunkById(count, column, alias) {
    column =
      column !== null && column !== void 0
        ? column
        : this.getRelated().getQualifiedKeyName()
    alias =
      alias !== null && alias !== void 0
        ? alias
        : this.getRelated().getKeyName()
    return this._prepareQueryBuilder().chunkById(count, column, alias)
  }

  each(count = 1000, singal) {
    return this._prepareQueryBuilder().each(count, singal)
  }

  _prepareQueryBuilder(columns = ['*']) {
    const builder = this._query.applyScopes()
    builder.addSelect(
      this._shouldSelect(builder.getQuery()._columns.length ? [] : columns)
    )
    return builder
  }

  getRelationExistenceQuery(query, parentQuery, columns = ['*']) {
    if (parentQuery.getModel().getTable() === query.getModel().getTable()) {
      return this.getRelationExistenceQueryForSelfRelation(
        query,
        parentQuery,
        columns
      )
    }

    if (parentQuery.getModel().getTable() === this._throughParent.getTable()) {
      return this.getRelationExistenceQueryForThroughSelfRelation(
        query,
        parentQuery,
        columns
      )
    }
    this._performJoin(query)
    return query
      .select(columns)
      .whereColumn(
        this.getQualifiedLocalKeyName(),
        '=',
        this.getQualifiedFirstKeyName()
      )
  }

  getRelationExistenceQueryForSelfRelation(
    query,
    parentQuery,
    columns = ['*']
  ) {
    const hash = this.getRelationCountHash()
    query.from(`${query.getModel().getTable()} as ${hash}`)
    query.join(
      this._throughParent.getTable(),
      this.getQualifiedParentKeyName(),
      '=',
      hash + '.' + this._secondKey
    )
    if (this.throughParentSoftDeletes()) {
      query.whereNull(this._throughParent.getQualifiedDeletedAtColumn())
    }
    query.getModel().setTable(hash)
    return query
      .select(columns)
      .whereColumn(
        parentQuery.getQuery().from + '.' + this._localKey,
        '=',
        this.getQualifiedFirstKeyName()
      )
  }

  getRelationExistenceQueryForThroughSelfRelation(
    query,
    parentQuery,
    columns = ['*']
  ) {
    const hash = this.getRelationCountHash()
    const table = `${this._throughParent.getTable()} as ${hash}`
    query.join(
      table,
      `${hash}.${this._secondLocalKey}`,
      '=',
      this.getQualifiedFarKeyName()
    )
    if (this.throughParentSoftDeletes()) {
      query.whereNull(`${hash}.${this._throughParent.getDeletedAtColumn()}`)
    }
    return query
      .select(columns)
      .whereColumn(
        `${parentQuery.getQuery().from}.${this._localKey}`,
        '=',
        `${hash}.${this._firstKey}`
      )
  }

  getQualifiedFarKeyName() {
    return this.getQualifiedForeignKeyName()
  }

  getFirstKeyName() {
    return this._firstKey
  }

  getQualifiedFirstKeyName() {
    return this._throughParent.qualifyColumn(this._firstKey)
  }

  getForeignKeyName() {
    return this._secondKey
  }

  getQualifiedForeignKeyName() {
    return this._related.qualifyColumn(this._secondKey)
  }

  getLocalKeyName() {
    return this._localKey
  }

  getQualifiedLocalKeyName() {
    return this._farParent.qualifyColumn(this._localKey)
  }

  getSecondLocalKeyName() {
    return this._secondLocalKey
  }
}
