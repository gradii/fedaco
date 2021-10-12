import { __awaiter } from 'tslib';
import { isBlank, isObject } from '@gradii/check-type';
import { last, uniq } from 'ramda';
import { raw } from '../../query-builder/ast-factory';
import { mixinForwardCallToQueryBuilder } from '../mixins/forward-call-to-query-builder';

export class Relation extends mixinForwardCallToQueryBuilder(class {
}) {

  constructor(query, parent) {
    super();
    this._query = query;
    this._parent = parent;
    this._related = query.getModel();

  }

  static noConstraints(callback) {
    const previous = Relation.constraints;
    Relation.constraints = false;
    let rst;
    try {
      rst = callback();
    } catch (e) {
      console.log(e);
    } finally {
      Relation.constraints = previous;
    }
    return rst;
  }

  addConstraints() {
    throw new Error('not implemented');
  }

  addEagerConstraints(models) {
    throw new Error('not implemented');
  }

  initRelation(models, relation) {
    throw new Error('not implemented');
  }

  match(models, results, relation) {
    throw new Error('not implemented');
  }

  getResults() {
    throw new Error('not implemented');
  }

  getEager() {
    return __awaiter(this, void 0, void 0, function* () {
      return this.get();
    });
  }

  sole(columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      const result = yield this.take(2).get(columns);
      if (!result.length) {
        throw new Error(`ModelNotFoundException().setModel(get_class(this._related))`);
      }
      if (result.length > 1) {
        throw new Error(`MultipleRecordsFoundException()`);
      }
      return result.pop();
    });
  }

  get(columns = ['*']) {
    return __awaiter(this, void 0, void 0, function* () {
      return this._query.get(columns);
    });
  }

  touch() {
    const model = this.getRelated();

    this.rawUpdate({
      [model.getUpdatedAtColumn()]: model.freshTimestampString()
    });

  }

  rawUpdate(attributes) {
    return this._query.withoutGlobalScopes().update(attributes);
  }

  getRelationExistenceCountQuery(query, parentQuery) {
    return this.getRelationExistenceQuery(query, parentQuery, raw('count(*)'));
  }

  getRelationExistenceQuery(query, parentQuery, columns = ['*']) {
    return query.select(columns)
      .whereColumn(this.getQualifiedParentKeyName(), '=', this.getExistenceCompareKey());
  }

  getExistenceCompareKey() {
    throw new Error('not implemented');
  }

  getRelationCountHash(incrementJoinCount = true) {
    return 'laravel_reserved_' + (incrementJoinCount ? Relation.selfJoinCount++ : Relation.selfJoinCount);
  }

  getKeys(models, key = null) {
    return uniq(models.map(value => {
      return key ? value.getAttribute(key) : value.getKey();
    })).sort();
  }

  getRelationQuery() {
    return this._query;
  }

  getQuery() {
    return this._query;
  }

  getBaseQuery() {
    return this.toBase();
  }

  toBase() {
    return this._query.getQuery();
  }

  getParent() {
    return this._parent;
  }

  getQualifiedParentKeyName() {
    return this._parent.getQualifiedKeyName();
  }

  getRelated() {
    return this._related;
  }

  createdAt() {
    return this._parent.getCreatedAtColumn();
  }

  updatedAt() {
    return this._parent.getUpdatedAtColumn();
  }

  relatedUpdatedAt() {
    return this._related.getUpdatedAtColumn();
  }

  whereInMethod(model, key) {
    return model.getKeyName() === last(key.split('.')) &&
    ['int', 'integer'].includes(model.getKeyType()) ? 'whereIntegerInRaw' : 'whereIn';
  }

  static morphMap(map = null, merge = true) {
    map = Relation.buildMorphMapFromModels(map);
    if (isObject(map)) {
      Relation._morphMap = merge && Relation._morphMap ? Object.assign(Object.assign({}, map), Relation._morphMap) : map;
    }
    return Relation._morphMap;
  }

  static buildMorphMapFromModels(models = null) {
    if (isBlank(models) || isObject(models)) {
      return models;
    }
    return (models).reduce((prev, clazz) => {
      const table = new clazz().getTable();
      prev[table] = clazz;
      return prev;
    }, {});
  }

  static getMorphedModel(alias) {
    var _a;

    return (_a = Relation._morphMap[alias]) !== null && _a !== void 0 ? _a : null;
  }
}

Relation.constraints = true;

Relation._morphMap = {};

Relation.selfJoinCount = 0;
