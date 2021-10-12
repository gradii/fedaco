import { __awaiter } from 'tslib';
import { isAnyEmpty, isArray, isBlank, isFunction, isNumber, isObject, isString } from '@gradii/check-type';
import { nth, omit, pluck } from 'ramda';
import { wrap } from '../helper/arr';
import { pascalCase } from '../helper/str';
import { mixinBuildQueries } from '../query-builder/mixins/build-query';
import { mixinForwardCallToQueryBuilder } from './mixins/forward-call-to-query-builder';
import { mixinGuardsAttributes } from './mixins/guards-attributes';
import { mixinQueriesRelationShips } from './mixins/queries-relationships';
import { Model } from './model';

import { Relation } from './relations/relation';
import { Scope } from './scope';

export class FedacoBuilder extends mixinGuardsAttributes(mixinQueriesRelationShips(mixinBuildQueries(mixinForwardCallToQueryBuilder(class {
})))) {
  constructor(_query) {
    super();
    this._query = _query;

    this._eagerLoad = {};

    this._localMacros = [];


    this._scopes = {};

    this._removedScopes = [];
  }

  make(attributes) {
    return this.newModelInstance(attributes);
  }

  withGlobalScope(identifier, scope) {
    this._scopes[identifier] = scope;
    if (isObject(scope) && 'extend' in scope) {

      scope.extend(this);
    }
    return this;
  }

  withoutGlobalScope(scope) {
    delete this._scopes[scope];
    this._removedScopes.push(scope);
    return this;
  }

  withoutGlobalScopes(scopes = null) {
    if (!isArray(scopes)) {
      scopes = Object.keys(this._scopes);
    }
    for (const scope of scopes) {
      this.withoutGlobalScope(scope);
    }
    return this;
  }

  removedScopes() {
    return this._removedScopes;
  }

  whereKey(id) {
    if (id instanceof Model) {
      id = id.getKey();
    }
    if (isArray(id)) {
      this._query.whereIn(this._model.getQualifiedKeyName(), id);
      return this;
    }
    if (id != null && this._model.getKeyType() === 'string') {
      id = `${id}`;
    }
    return this.where(this._model.getQualifiedKeyName(), '=', id);
  }

  whereKeyNot(id) {
    if (id instanceof Model) {
      id = id.getKey();
    }
    if (isArray(id)) {
      this._query.whereNotIn(this._model.getQualifiedKeyName(), id);
      return this;
    }
    if (id !== null && this._model.getKeyType() === 'string') {
      id = `${id}`;
    }
    return this.where(this._model.getQualifiedKeyName(), '!=', id);
  }

  where(column, operator, value, conjunction = 'and') {
    if (arguments.length === 2) {
      value = operator;
      operator = '=';
    }
    if (isFunction(column) && isBlank(operator)) {
      const query = this._model.newQueryWithoutRelationships();
      column(query);
      this._query.addNestedWhereQuery(query.getQuery(), conjunction);
    } else {
      this._query.where(column, operator, value, conjunction);
    }
    return this;
  }

  firstWhere(column, operator = null, value = null, conjunction = 'and') {
    return this.where(column, operator, value, conjunction).first();
  }

  orWhere(column, operator = null, value = null) {
    [value, operator] = this._query._prepareValueAndOperator(value, operator, arguments.length === 2);
    return this.where(column, operator, value, 'or');
  }

  latest(column = null) {
    var _a;
    if (isBlank(column)) {
      column = (_a = this._model.getCreatedAtColumn()) !== null && _a !== void 0 ? _a : 'created_at';
    }
    this._query.latest(column);
    return this;
  }

  oldest(column = null) {
    var _a;
    if (isBlank(column)) {
      column = (_a = this._model.getCreatedAtColumn()) !== null && _a !== void 0 ? _a : 'created_at';
    }
    this._query.oldest(column);
    return this;
  }

  hydrate(items) {
    const instance = this.newModelInstance();
    return instance.newCollection(items.map(item => {
      const model = instance.newFromBuilder(item);
      if (items.length > 1) {

      }
      return model;
    }));
  }

  fromQuery(query, bindings = []) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.hydrate(yield this._query.getConnection().select(query, bindings));
    });
  }

  find(id, columns = ['*']) {
    if (isArray(id)) {
      return this.findMany(id, columns);
    }
    return this.whereKey(id).first(columns);
  }

  findMany(ids, columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      if (isAnyEmpty(ids)) {
        return [];
      }
      return yield this.whereKey(ids).get(columns);
    });
  }

  findOrFail(id, columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      const result = yield this.find(id, columns);
      if (isArray(id) && isArray(result)) {
        if (result.length === id.length) {
          return result;
        }
      } else if (!isBlank(result)) {
        return result;
      }
      throw new Error(`ModelNotFoundException No query results for model [${this._model.constructor.name}] ${JSON.stringify(id)}`);
    });
  }

  findOrNew(id, columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      const model = yield this.find(id, columns);
      if (!isBlank(model)) {
        return model;
      }
      return this.newModelInstance();
    });
  }

  firstOrNew(attributes, values = {}) {
    return __awaiter(this, void 0, void 0, function* () {
      const instance = yield this.where(attributes).first();
      if (!isBlank(instance)) {
        return instance;
      }
      return this.newModelInstance(Object.assign(Object.assign({}, attributes), values));
    });
  }

  firstOrCreate(attributes, values = {}) {
    return __awaiter(this, void 0, void 0, function* () {
      let instance = yield this.where(attributes).first();
      if (!isBlank(instance)) {
        return instance;
      }
      instance = this.newModelInstance(Object.assign(Object.assign({}, attributes), values));
      yield instance.save();
      return instance;
    });
  }

  updateOrCreate(attributes, values) {
    return __awaiter(this, void 0, void 0, function* () {
      const instance = yield this.firstOrNew(attributes);
      yield instance.fill(values).save();
      return instance;
    });
  }

  firstOrFail(columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      const model = yield this.first(columns);
      if (!isBlank(model)) {

        return model;
      }
      throw new Error(`ModelNotFoundException No query results for model [${this._model.constructor.name}];`);
    });
  }

  firstOr(columns = ['*'], callback = null) {
    return __awaiter(this, void 0, void 0, function* () {
      if (isFunction(columns)) {
        callback = columns;
        columns = ['*'];
      }
      const model = yield this.first(columns);
      if (!isBlank(model)) {
        return model;
      }
      return callback();
    });
  }


  value(column) {
    return __awaiter(this, void 0, void 0, function* () {
      const result = yield this.first([column]);
      if (result) {
        return result[column];
      }
    });
  }

  get(columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      const builder = this.applyScopes();
      let models = yield builder.getModels(columns);
      if (models.length > 0) {
        models = yield builder.eagerLoadRelations(models);
      }
      return models;
    });
  }

  getModels(columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      return this._model.newQuery().hydrate(yield this._query.get(columns));
    });
  }

  eagerLoadRelations(models) {
    return __awaiter(this, void 0, void 0, function* () {
      for (const [name, constraints] of Object.entries(this._eagerLoad)) {


        if (!name.includes('.')) {
          models = yield this.eagerLoadRelation(models, name, constraints);
        }
      }
      return models;
    });
  }

  eagerLoadRelation(models, name, constraints) {
    return __awaiter(this, void 0, void 0, function* () {
      const relation = this.getRelation(name);
      relation.addEagerConstraints(models);
      constraints(relation);
      return relation.match(relation.initRelation(models, name), yield relation.getEager(), name);
    });
  }

  getRelation(name) {


    const relation = Relation.noConstraints(() => {
      const _relation = this.getModel().newInstance().newRelation(name);
      if (!_relation) {
        throw new Error(`RelationNotFoundException ${this.getModel().constructor.name} ${name}`);
      }
      return _relation;
    });
    const nested = this.relationsNestedUnder(name);


    if (!isAnyEmpty(nested)) {
      relation.getQuery().with(nested);
    }
    return relation;
  }

  relationsNestedUnder(relation) {
    const nested = {};
    for (const [name, constraints] of Object.entries(this._eagerLoad)) {
      if (this.isNestedUnder(relation, name)) {
        nested[name.substr((relation + '.').length)] = constraints;
      }
    }
    return nested;
  }

  isNestedUnder(relation, name) {
    return name.includes('.') && name.startsWith(relation + '.');
  }


  enforceOrderBy() {
    if (!this._query._orders.length && !this._query._unionOrders.length) {
      this.orderBy(this._model.getQualifiedKeyName(), 'asc');
    }
  }

  pluck(column, key) {
    return __awaiter(this, void 0, void 0, function* () {
      const results = yield this.toBase().pluck(column, key);
      if (

        !this._model.hasCast(column) &&
        !this._model.getDates().includes(column)) {
        return results;
      }
      if (isArray(results)) {
        return results.map(value => {
          return this._model.newFromBuilder({
            [column]: value
          })[column];
        });
      } else {
        throw new Error('not implement');
      }
    });
  }

  paginate(page = 1, pageSize, columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      pageSize = pageSize || this._model.getPerPage();
      const total = yield this.toBase().getCountForPagination();
      const results = total > 0 ? yield this.forPage(page, pageSize).get(columns) : [];
      return {
        items: results,
        total,
        pageSize, page
      };
    });
  }

  simplePaginate(page = 1, pageSize, columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      pageSize = pageSize || this._model.getPerPage();
      this.skip((page - 1) * pageSize).take(pageSize + 1);
      const results = yield this.get(columns);
      return {
        items: results,
        pageSize, page
      };
    });
  }


  create(attributes) {
    return __awaiter(this, void 0, void 0, function* () {
      const instance = this.newModelInstance(attributes);
      yield instance.save();
      return instance;
    });
  }

  forceCreate(attributes) {
    return this._model.constructor.unguarded(() => {
      return this.newModelInstance().newQuery().create(attributes);
    });
  }

  update(values) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.toBase().update(this.addUpdatedAtColumn(values));
    });
  }

  upsert(values, uniqueBy, update = null) {
    if (!values.length) {
      return 0;
    }
    if (!isArray(values)) {
      values = [values];
    }
    if (isBlank(update)) {
      update = Object.keys(values);
    }
    return this.toBase().upsert(this._addTimestampsToUpsertValues(values), uniqueBy, this._addUpdatedAtToUpsertColumns(update));
  }

  increment(column, amount = 1, extra = {}) {
    return this.toBase().increment(column, amount, this.addUpdatedAtColumn(extra));
  }

  decrement(column, amount = 1, extra = {}) {
    return this.toBase().decrement(column, amount, this.addUpdatedAtColumn(extra));
  }

  addUpdatedAtColumn(values) {
    if (!this._model.usesTimestamps() || isBlank(this._model.getUpdatedAtColumn())) {
      return values;
    }
    const column = this._model.getUpdatedAtColumn();
    values = Object.assign(Object.assign({}, values), {
      [column]: column in values ?
        values[column] :
        this._model.freshTimestampString()
    });


    return values;
  }

  _addTimestampsToUpsertValues(values) {
    if (!this._model.usesTimestamps()) {
      return values;
    }
    const timestamp = this._model.freshTimestampString();
    const columns = [
      this._model.getCreatedAtColumn(),
      this._model.getUpdatedAtColumn()
    ];
    for (const row of values) {
      for (const column of columns) {
        row[column] = timestamp;
      }
    }
    return values;
  }

  _addUpdatedAtToUpsertColumns(update) {
    if (!this._model.usesTimestamps()) {
      return update;
    }
    const column = this._model.getUpdatedAtColumn();
    if (!isBlank(column) && !update.includes(column)) {
      update.push(column);
    }
    return update;
  }

  delete() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this._onDelete !== undefined) {
        return this._onDelete.call(this, this);
      }
      return this.toBase().delete();
    });
  }

  forceDelete() {
    return this._query.delete();
  }

  onDelete(callback) {
    this._onDelete = callback;
  }

  hasNamedScope(scope) {
    return this._model && this._model.hasNamedScope(scope);
  }

  scopes(scopes) {
    let builder = this;
    for (let [scope, parameters] of Object.entries(wrap(scopes))) {
      if (isNumber(scope)) {
        [scope, parameters] = [parameters, []];
      }
      builder = builder._callNamedScope(scope, wrap(parameters));
    }
    return builder;
  }

  applyScopes() {
    if (isAnyEmpty(this._scopes)) {
      return this;
    }
    const builder = this.clone();
    for (const [identifier, scope] of Object.entries(this._scopes)) {
      if (builder._scopes[identifier] == null) {
        continue;
      }
      builder._callScope((_builder) => {
        if (isFunction(scope)) {
          scope(_builder);
        }
        if (scope instanceof Scope) {
          scope.apply(_builder, this.getModel());
        }
      });
    }
    return builder;
  }

  _callScope(scope, parameters = []) {
    var _a;
    parameters.unshift(this);
    const query = this.getQuery();
    const originalWhereCount = !query._wheres.length ? 0 : query._wheres.length;
    const result = (_a = scope(...parameters)) !== null && _a !== void 0 ? _a : this;
    if (query._wheres.length > originalWhereCount) {
      this.addNewWheresWithinGroup(query, originalWhereCount);
    }
    return result;
  }

  _callNamedScope(scope, parameters = []) {
    return this._callScope((params) => {
      return this._model.callNamedScope(scope, params);
    }, parameters);
  }

  addNewWheresWithinGroup(query, originalWhereCount) {
    const allWheres = query._wheres;
    query._wheres = [];
    this._groupWhereSliceForScope(query, allWheres.slice(0, originalWhereCount));
    this._groupWhereSliceForScope(query, allWheres.slice(originalWhereCount));
  }

  _groupWhereSliceForScope(query, whereSlice) {
    const whereBooleans = pluck('boolean', whereSlice);
    if (whereBooleans.includes('or')) {
      query._wheres.push(this._createNestedWhere(whereSlice, nth(0, whereBooleans)));
    } else {
      query._wheres = [...query._wheres, ...whereSlice];
    }
  }

  _createNestedWhere(whereSlice, conjunction = 'and') {
    const whereGroup = this.getQuery().forNestedWhere();
    whereGroup._wheres = whereSlice;
    return {
      'type': 'Nested',
      'query': whereGroup,
      'boolean': conjunction
    };
  }

  pipe(...args) {
    args.forEach(scopeFn => {
      scopeFn(this);
    });
    return this;
  }

  scope(scopeFn, ...args) {
    return this._callNamedScope(scopeFn, args);
  }

  whereScope(key, ...args) {
    const metadata = this._model._columnInfo(`scope${pascalCase(key)}`);
    if (metadata && metadata.isScope) {
      metadata.query(this, ...args);
      return this;
    }
    throw new Error('key is not in model or scope metadata is not exist');
  }

  with(relations, callback) {
    let eagerLoad;
    if (isFunction(callback)) {
      eagerLoad = this._parseWithRelations([{ [relations]: callback }]);
    } else {
      eagerLoad = this._parseWithRelations(isArray(relations) ? relations : [...arguments]);
    }
    this._eagerLoad = Object.assign(Object.assign({}, this._eagerLoad), eagerLoad);
    return this;
  }

  without(relations) {
    this._eagerLoad = omit(isString(relations) ? arguments : relations, this._eagerLoad);
    return this;
  }

  withOnly(relations) {
    this._eagerLoad = {};
    return this.with(relations);
  }

  newModelInstance(attributes) {
    return this._model.newInstance(attributes).setConnection(this._query.getConnection().getName());
  }

  _parseWithRelations(relations) {
    let results = {};
    for (const relation of relations) {
      if (isString(relation)) {
        const [name, constraints] = relation.includes(':') ?
          this.createSelectWithConstraint(relation) :
          [
            relation, () => {
          }
          ];
        results = this.addNestedWiths(name, results);
        results[name] = constraints;
      } else {
        for (const [name, constraints] of Object.entries(relation)) {
          this.addNestedWiths(name, results);
          results[name] = constraints;
        }
      }
    }
    return results;
  }

  createSelectWithConstraint(name) {
    return [
      name.split(':')[0], (query) => {
        query.select(name.split(':')[1].split(',').map(column => {
          if (column.includes('.')) {
            return column;
          }

          return query instanceof Relation.BelongsToMany ? query.getRelated().getTable() + '.' + column : column;
        }));
      }
    ];
  }

  addNestedWiths(name, results) {
    const progress = [];
    for (const segment of name.split('.')) {
      progress.push(segment);
      const last = progress.join('.');
      if (!(results[last] !== undefined)) {
        results[last] = () => {
        };
      }
    }
    return results;
  }

  withCasts(casts) {
    this._model.mergeCasts(casts);
    return this;
  }

  getQuery() {
    return this._query;
  }

  setQuery(query) {
    this._query = query;
    return this;
  }

  toBase() {
    return this.applyScopes().getQuery();
  }

  getEagerLoads() {
    return this._eagerLoad;
  }

  setEagerLoads(eagerLoad) {
    this._eagerLoad = eagerLoad;
    return this;
  }

  defaultKeyName() {
    return this.getModel().getKeyName();
  }

  getModel() {
    return this._model;
  }

  setModel(model) {
    this._model = model;
    this._query.from(model.getTable());
    return this;
  }

  qualifyColumn(column) {
    return this._model.qualifyColumn(column);
  }

  qualifyColumns(columns) {
    return this._model.qualifyColumns(columns);
  }


  __noSuchMethod__(methodName, args) {

    const metadata = this._model._columnInfo(`scope${pascalCase(methodName)}`);
    if (metadata && metadata.isScope) {
      metadata.query(this, ...args);
      return this;
    }
    throw new Error('no method found');
  }

  clone() {

    const builder = new FedacoBuilder(this._query.clone());
    builder._scopes = Object.assign({}, this._scopes);
    builder._model = this._model;
    builder._eagerLoad = Object.assign({}, this._eagerLoad);
    return builder;
  }
}

FedacoBuilder.macros = [];
