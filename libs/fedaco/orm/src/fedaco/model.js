import { __awaiter } from 'tslib';
import { isAnyEmpty, isArray, isBlank, isObjectEmpty, isString } from '@gradii/check-type';
import { difference, tap, uniq } from 'ramda';
import { except } from '../helper/obj';
import { plural, pluralStudy } from '../helper/pluralize';
import { camelCase, snakeCase, upperCaseFirst } from '../helper/str';
import { BaseModel } from './base-model';
import { FedacoBuilder } from './fedaco-builder';
import { mixinGuardsAttributes } from './mixins/guards-attributes';
import { mixinHasAttributes } from './mixins/has-attributes';
import { mixinHasEvents } from './mixins/has-events';
import { mixinHasGlobalScopes } from './mixins/has-global-scopes';
import { mixinHasRelationships } from './mixins/has-relationships';
import { mixinHasTimestamps } from './mixins/has-timestamps';
import { mixinHidesAttributes } from './mixins/hides-attributes';
import { loadAggregate } from './model-helper';

export function on(clazz, connection = null) {
  const instance = new clazz();
  instance.setConnection(connection);
  return instance.newQuery();
}

export function onWriteConnection(clazz) {
  return (new clazz()).newQuery().useWriteConnection();
}

export function all(clazz, columns = ['*']) {
  return (new clazz()).newQuery().get(columns);
}

export function withRelations(clazz, ...relations) {
  return (new clazz()).newQuery().with(relations);
}

export class Model extends mixinHasAttributes(mixinHasEvents(mixinHasGlobalScopes(mixinHasRelationships(mixinHasTimestamps(mixinHidesAttributes(mixinGuardsAttributes(BaseModel))))))) {

  constructor() {
    super();

    this._exists = false;

    this._wasRecentlyCreated = false;

    this._connection = undefined;

    this._table = undefined;

    this._tableAlias = undefined;

    this._primaryKey = 'id';
    this._keyType = 'int';
    this._incrementing = true;
    this._with = [];
    this._withCount = [];
    this._preventsLazyLoading = false;
    this._perPage = 10;
    this.bootIfNotBooted();

  }

  static initAttributes(attributes = {}) {
    const m = new (this)();
    m.syncOriginal();
    m.fill(attributes);
    return m;
  }

  bootIfNotBooted() {
    if (!(this.constructor.booted.has(this.constructor))) {
      this.constructor.booted.set(this.consturctor, true);
      this.fireModelEvent('booting', false);
      this.boot();
      this.fireModelEvent('booted', false);
    }
  }

  boot() {

  }

  fireModelEvent(event, arg) {
  }

  fill(attributes) {
    const totallyGuarded = this.totallyGuarded();
    for (const [key, value] of Object.entries(this._fillableFromArray(attributes))) {
      if (this.isFillable(key)) {
        this.setAttribute(key, value);
      } else if (totallyGuarded) {
        throw new Error(`MassAssignmentException(\`Add [${key}] to fillable property to allow mass assignment on [${this.constructor.name}].\`)`);
      }
    }
    return this;
  }

  forceFill(attributes) {
    return this.constructor.unguarded(() => {
      return this.fill(attributes);
    });
  }

  qualifyColumn(column) {
    if (column.includes('.')) {
      return column;
    }
    return `${this.getTable()}.${column}`;
  }

  qualifyColumns(columns) {
    return columns.map(column => {
      return this.qualifyColumn(column);
    });
  }

  newInstance(attributes = {}, exists = false) {
    const model = this.constructor.initAttributes(attributes);
    model._exists = exists;
    model.setConnection(this.getConnectionName());
    model.setTable(this.getTable());

    return model;
  }

  newFromBuilder(attributes = {}, connection = null) {
    const model = this.newInstance({}, true);
    model.setRawAttributes(attributes, true);
    model.setConnection(connection || this.getConnectionName());


    return model;
  }

  load(relations) {
    return __awaiter(this, arguments, void 0, function* () {
      const query = this.newQueryWithoutRelationships().with(
        isString(relations) ? arguments : relations);
      yield query.eagerLoadRelations([this]);
      return this;
    });
  }


  loadMissing(relations) {


    return this;
  }

  loadAggregate(relations, column, func = null) {

    loadAggregate([this], relations, column, func);
    return this;
  }

  loadCount(relations) {

    relations = isString(relations) ? arguments : relations;
    return this.loadAggregate(relations, '*', 'count');
  }

  loadMax(relations, column) {
    return this.loadAggregate(relations, column, 'max');
  }

  loadMin(relations, column) {
    return this.loadAggregate(relations, column, 'min');
  }

  loadSum(relations, column) {
    return this.loadAggregate(relations, column, 'sum');
  }

  loadAvg(relations, column) {
    return this.loadAggregate(relations, column, 'avg');
  }

  loadExists(relations) {
    return this.loadAggregate(relations, '*', 'exists');
  }

  loadMorphAggregate(relation, relations, column, func = null) {
    var _a;
    if (!this[relation]) {
      return this;
    }
    const className = this[relation].constructor;
    loadAggregate(this[relation], (_a = relations.get(className)) !== null && _a !== void 0 ? _a : [], column, func);
    return this;
  }

  loadMorphCount(relation, relations) {
    return this.loadMorphAggregate(relation, relations, '*', 'count');
  }

  loadMorphMax(relation, relations, column) {
    return this.loadMorphAggregate(relation, relations, column, 'max');
  }

  loadMorphMin(relation, relations, column) {
    return this.loadMorphAggregate(relation, relations, column, 'min');
  }

  loadMorphSum(relation, relations, column) {
    return this.loadMorphAggregate(relation, relations, column, 'sum');
  }

  loadMorphAvg(relation, relations, column) {
    return this.loadMorphAggregate(relation, relations, column, 'avg');
  }

  increment(column, amount = 1, extra = []) {
    return this.incrementOrDecrement(column, amount, extra, 'increment');
  }

  decrement(column, amount = 1, extra = []) {
    return this.incrementOrDecrement(column, amount, extra, 'decrement');
  }

  incrementOrDecrement(column, amount, extra, method) {
    const query = this.newQueryWithoutRelationships();
    if (!this._exists) {

      return query[method](column, amount, extra);
    }
    this[column] = this.isClassDeviable(column) ? this.deviateClassCastableAttribute(method, column, amount) : this[column] + (method === 'increment' ? amount : amount * -1);
    this.forceFill(extra);
    if (this._fireModelEvent('updating') === false) {
      return false;
    }

    return tap(this._setKeysForSaveQuery(query)[method](column, amount, extra), () => {
      this.syncChanges();
      this._fireModelEvent('updated', false);
      this.syncOriginalAttribute(column);
    });
  }

  update(attributes = {}, options = {}) {
    if (!this._exists) {
      return false;
    }
    return this.fill(attributes).save(options);
  }

  updateQuietly(attributes = [], options = []) {
    if (!this._exists) {
      return false;
    }
    return this.fill(attributes).saveQuietly(options);
  }

  push() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!(yield this.save())) {
        return false;
      }
      for (let models of Object.values(this._relations)) {
        models = isArray(models) ? models : [models];

        for (const model of models) {
          if (!isBlank(model)) {
            if (!(yield model.push())) {
              return false;
            }
          }
        }
      }
      return true;
    });
  }

  saveQuietly(options = {}) {

    return this.save(options);

  }

  save(options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
      this.mergeAttributesFromClassCasts();
      const query = this.newModelQuery();
      if (this._fireModelEvent('saving') === false) {
        return false;
      }
      let saved;
      if (this._exists) {
        saved = this.isDirty() ? yield this.performUpdate(query) : true;
      } else {
        saved = yield this.performInsert(query);
        const connection = query.getConnection();
        if (!this.getConnectionName() && connection) {
          this.setConnection(connection.getName());
        }
      }
      if (saved) {
        yield this.finishSave(options);
      }
      return saved;
    });
  }

  saveOrFail(options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.getConnection().transaction(() => __awaiter(this, void 0, void 0, function* () {
        return this.save(options);
      }));
    });
  }

  finishSave(options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      this._fireModelEvent('saved', false);
      if (this.isDirty() && ((_a = options['touch']) !== null && _a !== void 0 ? _a : true)) {
        yield this.touchOwners();
      }
      this.syncOriginal();
    });
  }

  performUpdate(query) {
    return __awaiter(this, void 0, void 0, function* () {
      if (this._fireModelEvent('updating') === false) {
        return false;
      }
      if (this.usesTimestamps()) {
        this.updateTimestamps();
      }
      const dirty = this.getDirty();
      if (!isObjectEmpty(dirty)) {
        yield this._setKeysForSaveQuery(query).update(dirty);
        this.syncChanges();
        this._fireModelEvent('updated', false);
      }
      return true;
    });
  }

  _setKeysForSelectQuery(query) {
    query.where(this.getKeyName(), '=', this._getKeyForSelectQuery());
    return query;
  }

  _getKeyForSelectQuery() {
    var _a;
    return (_a = this.original[this.getKeyName()]) !== null && _a !== void 0 ? _a : this.getKey();
  }

  _setKeysForSaveQuery(query) {
    query.where(this.getKeyName(), '=', this.getKeyForSaveQuery());
    return query;
  }

  getKeyForSaveQuery() {
    var _a;
    return (_a = this._original[this.getKeyName()]) !== null && _a !== void 0 ? _a : this.getKey();
  }

  performInsert(query) {
    return __awaiter(this, void 0, void 0, function* () {
      if (this._fireModelEvent('creating') === false) {
        return false;
      }
      if (this.usesTimestamps()) {
        this.updateTimestamps();
      }
      const attributes = this.getAttributesForInsert();
      if (this.getIncrementing()) {
        yield this.insertAndSetId(query, attributes);
      } else {
        if (isAnyEmpty(attributes)) {
          return true;
        }
        yield query.insert(attributes);
      }
      this._exists = true;
      this.wasRecentlyCreated = true;
      this._fireModelEvent('created', false);
      return true;
    });
  }

  insertAndSetId(query, attributes) {
    return __awaiter(this, void 0, void 0, function* () {
      const keyName = this.getKeyName();
      const id = yield query.insertGetId(attributes, keyName);
      this.setAttribute(keyName, id);
    });
  }


  delete() {
    return __awaiter(this, void 0, void 0, function* () {
      this.mergeAttributesFromClassCasts();
      if (isBlank(this.getKeyName())) {
        throw new Error('LogicException No primary key defined on model.');
      }
      if (!this._exists) {
        return null;
      }
      if (this._fireModelEvent('deleting') === false) {
        return false;
      }
      yield this.touchOwners();
      yield this._performDeleteOnModel();
      this._fireModelEvent('deleted', false);
      return true;
    });
  }

  forceDelete() {
    return __awaiter(this, void 0, void 0, function* () {
      return this.delete();
    });
  }

  _performDeleteOnModel() {
    return __awaiter(this, void 0, void 0, function* () {
      yield this._setKeysForSaveQuery(this.newModelQuery()).delete();
      this._exists = false;
    });
  }

  static createQuery() {
    return (new this()).newQuery();
  }

  newQuery() {
    return this.registerGlobalScopes(this.newQueryWithoutScopes());
  }

  newModelQuery() {
    return this.newEloquentBuilder(this.newBaseQueryBuilder()).setModel(this);
  }

  newQueryWithoutRelationships() {
    return this.registerGlobalScopes(this.newModelQuery());
  }

  registerGlobalScopes(builder) {
    for (const [identifier, scope] of Object.entries(this.getGlobalScopes())) {
      builder.withGlobalScope(identifier, scope);
    }
    return builder;
  }

  newQueryWithoutScopes() {
    return this.newModelQuery().with(this._with).withCount(this._withCount);
  }

  newQueryWithoutScope(scope) {
    return this.newQuery().withoutGlobalScope(scope);
  }

  newQueryForRestoration(ids) {
    return isArray(ids) ?
      this.newQueryWithoutScopes().whereIn(this.getQualifiedKeyName(), ids) :
      this.newQueryWithoutScopes().whereKey(ids);
  }

  newEloquentBuilder(query) {
    return new FedacoBuilder(query);
  }

  newBaseQueryBuilder() {
    return this.getConnection().query();
  }

  newCollection(models = []) {
    return models;
  }

  hasNamedScope(scope) {
    return `scope${upperCaseFirst(scope)}` in this;
  }

  callNamedScope(scope, ...parameters) {
    return (this['scope' + upperCaseFirst(scope)]).apply(this, parameters);
  }

  toArray() {
    return Object.assign(Object.assign({}, this.attributesToArray()), this.relationsToArray());
  }


  jsonSerialize() {
    return this.toArray();
  }


  refresh() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this._exists) {
        return this;
      }
      const result = yield this._setKeysForSelectQuery(this.newQueryWithoutScopes()).firstOrFail();
      this.setRawAttributes(result._attributes);


      this.syncOriginal();
      return this;
    });
  }

  replicate(excepts = null) {
    const defaults = [this.getKeyName(), this.getCreatedAtColumn(), this.getUpdatedAtColumn()];
    const attributes = except(this.getAttributes(), excepts ? uniq([...excepts, ...defaults]) : defaults);
    return tap(instance => {
      instance.setRawAttributes(attributes);
      instance.setRelations(this._relations);
      instance.fireModelEvent('replicating', false);
    }, new this.constructor());
  }

  is(model) {
    return !isBlank(model) &&
      this.getKey() === model.getKey() &&
      this.getTable() === model.getTable() &&
      this.getConnectionName() === model.getConnectionName();
  }

  isNot(model) {
    return !this.is(model);
  }

  getConnection() {
    return this.constructor.resolveConnection(this.getConnectionName());
  }

  getConnectionName() {
    return this._connection;
  }

  setConnection(name) {
    this._connection = name;
    return this;
  }

  static resolveConnection(connection = null) {
    return this.resolver.connection(connection);
  }

  static getConnectionResolver() {
    return this.resolver;
  }

  static setConnectionResolver(resolver) {
    this.resolver = resolver;
  }

  static unsetConnectionResolver() {
    this.resolver = null;
  }

  getTable() {
    return this._table || snakeCase(pluralStudy(this.constructor.name));
  }

  setTable(table) {
    this._table = table;
    return this;
  }

  getKeyName() {
    return this._primaryKey;
  }

  setKeyName(key) {
    this._primaryKey = key;
    return this;
  }

  getQualifiedKeyName() {
    return this.qualifyColumn(this.getKeyName());
  }

  getKeyType() {
    return this._keyType;
  }

  setKeyType(type) {
    this._keyType = type;
    return this;
  }

  getIncrementing() {
    return this._incrementing;
  }

  setIncrementing(value) {
    this._incrementing = value;
    return this;
  }

  getKey() {
    return this.getAttribute(this.getKeyName());
  }

  getQueueableId() {
    return this.getKey();
  }


  getQueueableConnection() {
    return this.getConnectionName();
  }

  getRouteKey() {
    return this.getAttribute(this.getRouteKeyName());
  }

  getRouteKeyName() {
    return this.getKeyName();
  }

  resolveRouteBinding(value, field = null) {
    return this.where(field !== null && field !== void 0 ? field : this.getRouteKeyName(), value).first();
  }

  resolveSoftDeletableRouteBinding(value, field = null) {
    return this.where(field !== null && field !== void 0 ? field : this.getRouteKeyName(), value).withTrashed().first();
  }

  resolveChildRouteBinding(childType, value, field) {
    return this.resolveChildRouteBindingQuery(childType, value, field).first();
  }

  resolveSoftDeletableChildRouteBinding(childType, value, field) {
    return this.resolveChildRouteBindingQuery(childType, value, field).withTrashed().first();
  }

  resolveChildRouteBindingQuery(childType, value, field) {

    const relationship = this[plural(camelCase(childType))]();
    field = field || relationship.getRelated().getRouteKeyName();


    return relationship.where(field, value);

  }

  getForeignKey() {
    return snakeCase(this.constructor.name) + '_' + this.getKeyName();
  }

  getPerPage() {
    return this._perPage;
  }

  setPerPage(perPage) {
    this._perPage = perPage;
    return this;
  }


  static useConnection(connection) {
    const instance = new this();
    instance.setConnection(connection);
    return instance.newQuery();
  }

  static withoutTouching(callback) {
    Model.withoutTouchingOn([Model], callback);
  }

  static withoutTouchingOn(models, callback) {
    Model.ignoreOnTouch = [...Model.ignoreOnTouch, ...models];
    try {
      callback();
    } finally {
      Model.ignoreOnTouch = difference(Model.ignoreOnTouch, models);
    }
  }

  static isIgnoringTouch(clazz) {
    clazz = clazz || Model;


    for (const ignoredClass of Model.ignoreOnTouch) {
      if (clazz === ignoredClass || ignoredClass.constructor instanceof clazz.constructor) {
        return true;
      }
    }
    return false;
  }
}

Model.ignoreOnTouch = [];
Model.booted = new Map();
