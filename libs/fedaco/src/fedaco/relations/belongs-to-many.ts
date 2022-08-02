/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray, isBlank, isObject } from '@gradii/check-type';
import { uniq } from 'ramda';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Collection } from '../../define/collection';
import type { Constructor } from '../../helper/constructor';
import { pluralStudy } from '../../helper/pluralize';
import { camelCase } from '../../helper/str';
import { QueryBuilder } from '../../query-builder/query-builder';
import type { RawExpression } from '../../query/ast/expression/raw-expression';
import type { FedacoBuilder } from '../fedaco-builder';
import type { Model } from '../model';
import type { AsPivot } from './concerns/as-pivot';
import type {
  InteractsWithDictionary} from './concerns/interacts-with-dictionary';
import { mixinInteractsWithDictionary
} from './concerns/interacts-with-dictionary';
import type {
  InteractsWithPivotTable} from './concerns/interacts-with-pivot-table';
import { mixinInteractsWithPivotTable
} from './concerns/interacts-with-pivot-table';
import { Relation } from './relation';

export interface BelongsToMany extends InteractsWithDictionary, InteractsWithPivotTable, Constructor<Relation> {

}

export class BelongsToMany extends mixinInteractsWithDictionary(
  mixinInteractsWithPivotTable(
    Relation
  )
) {
  /*The intermediate table for the relation.*/
  _table: string;
  /*The foreign key of the parent model.*/
  _foreignPivotKey: string;
  /*The associated key of the relation.*/
  _relatedPivotKey: string;
  /*The key name of the parent model.*/
  _parentKey: string;
  /*The key name of the related model.*/
  _relatedKey: string;
  /*The "name" of the relationship.*/
  _relationName: string;
  /*The pivot table columns to retrieve.*/
  _pivotColumns: any[] = [];
  /*Any pivot table restrictions for where clauses.*/
  _pivotWheres: any[] = [];
  /*Any pivot table restrictions for whereIn clauses.*/
  _pivotWhereIns: any[] = [];
  /*Any pivot table restrictions for whereNull clauses.*/
  _pivotWhereNulls: any[] = [];
  /*The default values for the pivot columns.*/
  _pivotValues: { column: string, value: any }[] = [];
  /*Indicates if timestamps are available on the pivot table.*/
  _withTimestamps = false;
  /*The custom pivot table column for the created_at timestamp.*/
  _pivotCreatedAt: string;
  /*The custom pivot table column for the updated_at timestamp.*/
  _pivotUpdatedAt: string;
  /*The class name of the custom pivot model to use for the relationship.*/
  _using: typeof AsPivot;
  /*The name of the accessor to use for the "pivot" relationship.*/
  _accessor = 'pivot';

  /*Create a new belongs to many relationship instance.*/
  public constructor(query: FedacoBuilder,
    parent: Model,
    table: string,
    foreignPivotKey: string,
    relatedPivotKey: string,
    parentKey: string,
    relatedKey: string,
    relationName: string | null = null) {
    super(query, parent);
    this._parentKey = parentKey;
    this._relatedKey = relatedKey;
    this._relationName = relationName;
    this._relatedPivotKey = relatedPivotKey;
    this._foreignPivotKey = foreignPivotKey;
    this._table = table;
    this.addConstraints();
  }

  /*Attempt to resolve the intermediate table name from the given string.*/
  // _resolveTableName(table: string) {
  //   if (!Str.contains(table, '\\') || !class_exists(table)) {
  //     return table;
  //   }
  //   let model = new table();
  //   if (!model instanceof Model) {
  //     return table;
  //   }
  //   if (in_array(AsPivot, class_uses_recursive(model))) {
  //     this.using(table);
  //   }
  //   return model.getTable();
  // }

  /*Set the base constraints on the relation query.*/
  public addConstraints() {
    this._performJoin();
    if ((this.constructor as any).constraints) {
      this._addWhereConstraints();
    }
  }

  /*Set the join clause for the relation query.*/
  _performJoin(query: FedacoBuilder | null = null) {
    query = query || this._query;
    query.join(this._table, this.getQualifiedRelatedKeyName(), '=',
      this.getQualifiedRelatedPivotKeyName());
    return this;
  }

  /*Set the where clause for the relation query.*/
  _addWhereConstraints() {
    this._query.where(
      this.getQualifiedForeignPivotKeyName(),
      '=',
      this._parent[this._parentKey]
    );
    return this;
  }

  /*Set the constraints for an eager load of the relation.*/
  public addEagerConstraints(models: any[]) {
    const whereIn = this._whereInMethod(this._parent, this._parentKey);
    this._query[whereIn](this.getQualifiedForeignPivotKeyName(),
      this.getKeys(models, this._parentKey));
  }

  /*Initialize the relation on a set of models.*/
  public initRelation(models: any[], relation: string) {
    for (const model of models) {
      model.setRelation(relation, this._related.newCollection());
    }
    return models;
  }

  /*Match the eagerly loaded results to their parents.*/
  public match(models: any[], results: Collection, relation: string) {
    const dictionary = this._buildDictionary(results);
    for (const model of models) {
      const key = this._getDictionaryKey(model[this._parentKey]);
      if (dictionary[key] !== undefined) {
        model.setRelation(relation, this._related.newCollection(dictionary[key]));
      }
    }
    return models;
  }

  /*Build model dictionary keyed by the relation's foreign key.*/
  _buildDictionary(results: Collection): { [key: string]: any[] } {
    const dictionary: { [key: string]: any[] } = {};
    for (const result of results) {
      const value = this._getDictionaryKey(
        (result.getRelation(this._accessor) as Model).getAttributeValue(this._foreignPivotKey)
      );
      if (!isArray(dictionary[value])) {
        dictionary[value] = [];
      }
      dictionary[value].push(result);
    }
    return dictionary;
  }

  // /*Get the class being used for pivot models.*/
  // public getPivotClass() {
  //   return this._using ?? Pivot;
  // }

  /*Specify the custom pivot model to use for the relationship.*/
  public using(clazz: typeof AsPivot) {
    this._using = clazz;
    return this;
  }

  /*Specify the custom pivot accessor to use for the relationship.*/
  public as(accessor: string) {
    this._accessor = accessor;
    return this;
  }

  /*Set a where clause for a pivot table column.*/
  public wherePivot(column: string,
    value: any): FedacoBuilder;
  // public wherePivot(column: string,
  //                   value: any,
  //                   conjunction?): QueryBuilder;
  public wherePivot(column: string,
    operator?: string,
    value?: any,
    conjunction?: 'and' | 'or' | string): FedacoBuilder;
  public wherePivot(column: string,
    operator?: any,
    value?: any,
    conjunction: 'and' | 'or' = 'and'): FedacoBuilder {
    if (arguments.length === 2) {
      value = operator;
      operator = '=';
    }
    this._pivotWheres.push([...arguments]);
    return this.getQuery().where(this.qualifyPivotColumn(column), operator, value, conjunction);
  }

  /*Set a "where between" clause for a pivot table column.*/
  public wherePivotBetween(column: string, values: any[],
    conjunction = 'and',
    not = false) {
    return this.getQuery().whereBetween(this.qualifyPivotColumn(column), values, conjunction, not);
  }

  /*Set a "or where between" clause for a pivot table column.*/
  public orWherePivotBetween(column: string, values: any[]) {
    return this.wherePivotBetween(column, values, 'or');
  }

  /*Set a "where pivot not between" clause for a pivot table column.*/
  public wherePivotNotBetween(column: string, values: any[], conjunction = 'and') {
    return this.wherePivotBetween(column, values, conjunction, true);
  }

  /*Set a "or where not between" clause for a pivot table column.*/
  public orWherePivotNotBetween(column: string, values: any[]) {
    return this.wherePivotBetween(column, values, 'or', true);
  }

  /*Set a "where in" clause for a pivot table column.*/
  public wherePivotIn(column: string, values: any, conjunction = 'and',
    not = false) {
    this._pivotWhereIns.push([...arguments]);
    return this.whereIn(this.qualifyPivotColumn(column), values, conjunction, not);
  }

  /*Set an "or where" clause for a pivot table column.*/
  public orWherePivot(column: string, operator: any = null, value: any = null) {
    return this.wherePivot(column, operator, value, 'or');
  }

  /*Set a where clause for a pivot table column.

  In addition, new pivot records will receive this value.*/
  public withPivotValue(column: string | any[] | object, value: any = null) {
    if (isObject(column)) {
      for (const [name, val] of Object.entries(column)) {
        this.withPivotValue(name, val);
      }
      return this;
    }
    if (isBlank(value)) {
      throw new Error('InvalidArgumentException The provided value may not be null.');
    }
    this._pivotValues.push({ column, value });
    return this.wherePivot(column, '=', value);
  }

  /*Set an "or where in" clause for a pivot table column.*/
  public orWherePivotIn(column: string, values: any) {
    return this.wherePivotIn(column, values, 'or');
  }

  /*Set a "where not in" clause for a pivot table column.*/
  public wherePivotNotIn(column: string, values: any, conjunction = 'and') {
    return this.wherePivotIn(column, values, conjunction, true);
  }

  /*Set an "or where not in" clause for a pivot table column.*/
  public orWherePivotNotIn(column: string, values: any) {
    return this.wherePivotNotIn(column, values, 'or');
  }

  /*Set a "where null" clause for a pivot table column.*/
  public wherePivotNull(column: string, conjunction = 'and', not = false) {
    this._pivotWhereNulls.push([...arguments]);
    return this.whereNull(this.qualifyPivotColumn(column), conjunction, not);
  }

  /*Set a "where not null" clause for a pivot table column.*/
  public wherePivotNotNull(column: string, conjunction = 'and') {
    return this.wherePivotNull(column, conjunction, true);
  }

  /*Set a "or where null" clause for a pivot table column.*/
  public orWherePivotNull(column: string, not = false) {
    return this.wherePivotNull(column, 'or', not);
  }

  /*Set a "or where not null" clause for a pivot table column.*/
  public orWherePivotNotNull(column: string) {
    return this.orWherePivotNull(column, true);
  }

  /*Add an "order by" clause for a pivot table column.*/
  public orderByPivot(column: string, direction = 'asc') {
    return this.orderBy(this.qualifyPivotColumn(column), direction);
  }

  /*Find a related model by its primary key or return a new instance of the related model.*/
  public async findOrNew(id: any, columns: any[] = ['*']): Promise<Model> {
    let instance = await this.find(id, columns) as Model;
    if (isBlank(instance)) {
      instance = this._related.newInstance();
    }
    return instance;
  }

  /*Get the first related model record matching the attributes or instantiate it.*/
  public async firstOrNew(attributes: any = {}, values: any[] = []) {
    let instance = await this._related.newQuery().where(attributes).first();
    if (isBlank(instance)) {
      instance = this._related.newInstance([...attributes, ...values]);
    }
    return instance;
  }

  /*Get the first related record matching the attributes or create it.*/
  public async firstOrCreate(attributes: any = {},
    values: any = {},
    joining: any[] = [],
    touch = true) {
    let instance = await this._related.newQuery().where(attributes).first();
    if (isBlank(instance)) {
      instance = await this.create({ ...attributes, ...values }, joining, touch);
    }
    return instance;
  }

  /*Create or update a related record matching the attributes, and fill it with values.*/
  public async updateOrCreate(attributes: any[],
    values: any[] = [],
    joining: any[] = [],
    touch = true) {
    const instance = await this._related.newQuery().where(attributes).first() as Model;
    if (isBlank(instance)) {
      return this.create([...attributes, ...values], joining, touch);
    }
    instance.fill(values);
    await instance.save({
      'touch': false
    });
    return instance;
  }

  /*Find a related model by its primary key.*/
  public async find(id: any, columns: any[] = ['*']): Promise<Model | Model[]> {
    if (isArray(id) /*|| id instanceof Arrayable*/) {
      return this.findMany(id, columns);
    }
    return this.where(this.getRelated().getQualifiedKeyName(), '=', this._parseIds(id))
      .first(columns);
  }

  /*Find multiple related models by their primary keys.*/
  public async findMany(ids: any[], columns: any[] = ['*']) {
    if (!ids.length) {
      return this.getRelated().newCollection();
    }
    return this.whereIn(this.getRelated().getQualifiedKeyName(), this._parseIds(ids)).get(columns);
  }

  /*Find a related model by its primary key or throw an exception.*/
  public async findOrFail(id: any, columns: any[] = ['*']) {
    const result = await this.find(id, columns);
    // var id     = id instanceof Arrayable ? id.toArray() : id;
    if (isArray(id)) {
      if (result.length === uniq(id).length) {
        return result;
      }
    } else if (!isBlank(result)) {
      return result;
    }
    throw new Error(`ModelNotFoundException().setModel(get_class(this._related), id);`);
  }

  firstWhere(left: string, operator?: string,
    right?: ((q: this) => void) | RawExpression | boolean | string | number | Array<string | number>,
    conjunction?: 'and' | 'or' | string
  ): Promise<Model>;

  firstWhere(left: ((q: this) => void) | string | any[], operator?: string,
    right?: ((q: this) => void) | RawExpression | boolean | string | number | Array<string | number>,
    conjunction?: 'and' | 'or' | string
  ): Promise<Model>;

  /*Add a basic where clause to the query, and return the first result.*/
  public firstWhere(column: ((q: this) => void) | string | any[],
    operator: any = null,
    value: any = null,
    conjunction: 'and' | 'or' | string = 'and'): Promise<Model> {
    return this.where(column, operator, value, conjunction).first();
  }

  /*Execute the query and get the first result.*/
  public async first(columns: any[] = ['*']): Promise<Model> {
    const results = await this.take(1).get(columns);
    return results.length > 0 ? results[0] : null;
  }

  /*Execute the query and get the first result or throw an exception.*/
  public firstOrFail(columns: any[] = ['*']) {
    const model = this.first(columns);
    if (!isBlank(model)) {
      return model;
    }
    throw new Error(`ModelNotFoundException().setModel(get_class(this._related))`);
  }

  /*Get the results of the relationship.*/
  public async getResults() {
    return !isBlank(this._parent[this._parentKey]) ?
      await this.get() :
      this._related.newCollection();
  }

  /*Execute the query as a "select" statement.*/
  public async get(columns: any[] = ['*']) {
    // First we'll add the proper select columns onto the query so it is run with
    // the proper columns. Then, we will get the results and hydrate our pivot
    // models with the result of those columns as a separate model relation.
    const builder = this._query.applyScopes();
    columns = builder.getQuery()._columns.length ? [] : columns;
    let models = await builder.addSelect(this._shouldSelect(columns)).getModels();
    this._hydratePivotRelation(models);
    if (models.length > 0) {
      models = await builder.eagerLoadRelations(models);
    }
    return this._related.newCollection(models);
  }

  /*Get the select columns for the relation query.*/
  _shouldSelect(columns: any[] = ['*']) {
    if (columns.length === 1 && columns[0] === '*') {
      columns = [`${this._related.getTable()}.*`];
    }
    return [...columns, ...this._aliasedPivotColumns()];
  }

  /*Get the pivot columns for the relation.

  "pivot_" is prefixed ot each column for easy removal later.*/
  _aliasedPivotColumns() {
    const defaults = [this._foreignPivotKey, this._relatedPivotKey];
    return uniq([...defaults, ...this._pivotColumns].map(column => {
      return this.qualifyPivotColumn(column) + ' as pivot_' + column;
    }));
  }

  /*Get a paginator for the "select" statement.*/
  public async paginate(page: number = 1,
    pageSize?: number,
    columns: any[] = ['*']) {
    this._prepareQueryBuilder();
    const results = await this._query.paginate(page, pageSize, columns);
    this._hydratePivotRelation(results.items);
    return results;
  }

  /*Chunk the results of the query.*/
  public chunk(count: number,
    signal?: Observable<any>): Observable<{ results: any[], page: number }> {
    this._prepareQueryBuilder();
    return this._query
      .chunk(count)
      .pipe(
        tap(({ results, page }) => {
          this._hydratePivotRelation(results);
        })
      );
  }

  /*Chunk the results of a query by comparing numeric IDs.*/
  public chunkById(count: number,
    column?: string,
    alias?: string,
    signal?: Observable<any>): Observable<{ results: any, page: number }> {
    this._prepareQueryBuilder();
    column = column ?? this.getRelated().qualifyColumn(this.getRelatedKeyName());
    alias = alias ?? this.getRelatedKeyName();
    return this._query.chunkById(count, column, alias).pipe(
      tap(({ results }) => {
        this._hydratePivotRelation(results);
      })
    );
  }

  /*Execute a callback over each item while chunking.*/
  public each(count: number = 1000, signal?: Observable<any>) {
    return this._prepareQueryBuilder()
      .each(count, signal)
      .pipe(
        tap(({ item, index }) => {
          this._hydratePivotRelation([item]);
        })
      );
  }

  /*Prepare the query builder for query execution.*/
  _prepareQueryBuilder() {
    return this._query.addSelect(this._shouldSelect());
  }

  /*Hydrate the pivot table relationship on the models.*/
  _hydratePivotRelation(models: any[]) {
    for (const model of models) {
      // _additionalProcessingGetter(model.constructor, 'pivot', undefined, true);
      model.setRelation(this._accessor, this.newExistingPivot(this._migratePivotAttributes(model)));
    }
  }

  /*Get the pivot attributes from a model.*/
  _migratePivotAttributes(model: Model) {
    const values: any = {};
    for (const [key, value] of Object.entries(model.getAttributes())) {
      if (key.startsWith('pivot_')) {
        values[key.substr(6)] = value;
        delete model.key;
      }
    }
    return values;
  }

  /*If we're touching the parent model, touch.*/
  public async touchIfTouching() {
    if (this._touchingParent()) {
      await this.getParent().touch();
    }
    if (this.getParent().touches(this._relationName)) {
      await this.touch();
    }
  }

  /*Determine if we should touch the parent on sync.*/
  _touchingParent() {
    return this.getRelated().touches(this._guessInverseRelation());
  }

  /*Attempt to guess the name of the inverse of the relation.*/
  _guessInverseRelation() {
    return camelCase(pluralStudy(this.getParent().getTable()));
  }

  /*Touch all of the related models for the relationship.

  E.g.: Touch all roles associated with this user.*/
  public async touch() {
    const key = this.getRelated().getKeyName();
    const columns = {
      [this._related.getUpdatedAtColumn()]: this._related.freshTimestampString(),
    };
    const ids = await this.allRelatedIds();
    if (ids.length > 0) {
      await this.getRelated().newQueryWithoutRelationships().whereIn(key, ids).update(columns);
    }
  }

  /*Get all of the IDs for the related models.*/
  public allRelatedIds(): Promise<any[]> {
    return this.newPivotQuery().pluck(this._relatedPivotKey) as Promise<any[]>;
  }

  /*Save a new model and attach it to the parent model.*/
  public save(model: Model, pivotAttributes: any[] = [], touch = true) {
    model.save({
      'touch': false
    });
    this.attach(model, pivotAttributes, touch);
    return model;
  }

  /*Save an array of new models and attach them to the parent model.*/
  public saveMany(models: Collection | any[], pivotAttributes: any = {}) {
    for (const [key, model] of Object.entries(models)) {
      this.save(model, /*cast type array*/ pivotAttributes[key] ?? [], false);
    }
    this.touchIfTouching();
    return models;
  }

  /*Create a new instance of the related model.*/
  public async create(attributes: any = {}, joining: any[] = [], touch = true) {
    const instance = this._related.newInstance(attributes);
    await instance.save({
      'touch': false
    });
    this.attach(instance, joining, touch);
    return instance;
  }

  /*Create an array of new instances of the related models.*/
  public createMany(records: any[], joinings: any = {}) {
    const instances = [];
    for (const [key, record] of Object.entries(records)) {
      instances.push(this.create(record, /*cast type array*/ joinings[key] ?? [], false));
    }
    this.touchIfTouching();
    return instances;
  }

  /*Add the constraints for a relationship query.*/
  public getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder,
    columns: any[] | any = ['*']) {
    if (parentQuery.getQuery().from == query.getQuery().from) {
      return this.getRelationExistenceQueryForSelfJoin(query, parentQuery, columns);
    }
    this._performJoin(query);
    return super.getRelationExistenceQuery(query, parentQuery, columns);
  }

  /*Add the constraints for a relationship query on the same table.*/
  public getRelationExistenceQueryForSelfJoin(query: FedacoBuilder,
    parentQuery: FedacoBuilder,
    columns: any[] | any = ['*']) {
    query.select(columns);
    const hash = this.getRelationCountHash();
    query.from(`${this._related.getTable()} as ${hash}`);
    this._related.setTable(hash);
    this._performJoin(query);
    return super.getRelationExistenceQuery(query, parentQuery, columns);
  }

  /*Get the key for comparing against the parent key in "has" query.*/
  public getExistenceCompareKey() {
    return this.getQualifiedForeignPivotKeyName();
  }

  /*Specify that the pivot table has creation and update timestamps.*/
  public withTimestamps(createdAt: any = null, updatedAt: any = null) {
    this._withTimestamps = true;
    this._pivotCreatedAt = createdAt;
    this._pivotUpdatedAt = updatedAt;
    return this.withPivot(this.createdAt(), this.updatedAt());
  }

  /*Get the name of the "created at" column.*/
  public createdAt() {
    return this._pivotCreatedAt || this._parent.getCreatedAtColumn();
  }

  /*Get the name of the "updated at" column.*/
  public updatedAt() {
    return this._pivotUpdatedAt || this._parent.getUpdatedAtColumn();
  }

  /*Get the foreign key for the relation.*/
  public getForeignPivotKeyName() {
    return this._foreignPivotKey;
  }

  /*Get the fully qualified foreign key for the relation.*/
  public getQualifiedForeignPivotKeyName() {
    return this.qualifyPivotColumn(this._foreignPivotKey);
  }

  /*Get the "related key" for the relation.*/
  public getRelatedPivotKeyName() {
    return this._relatedPivotKey;
  }

  /*Get the fully qualified "related key" for the relation.*/
  public getQualifiedRelatedPivotKeyName() {
    return this.qualifyPivotColumn(this._relatedPivotKey);
  }

  /*Get the parent key for the relationship.*/
  public getParentKeyName() {
    return this._parentKey;
  }

  /*Get the fully qualified parent key name for the relation.*/
  public getQualifiedParentKeyName() {
    return this._parent.qualifyColumn(this._parentKey);
  }

  /*Get the related key for the relationship.*/
  public getRelatedKeyName() {
    return this._relatedKey;
  }

  /*Get the fully qualified related key name for the relation.*/
  public getQualifiedRelatedKeyName() {
    return this._related.qualifyColumn(this._relatedKey);
  }

  /*Get the intermediate table for the relationship.*/
  public getTable() {
    return this._table;
  }

  /*Get the relationship name for the relationship.*/
  public getRelationName() {
    return this._relationName;
  }

  /*Get the name of the pivot accessor for this relationship.*/
  public getPivotAccessor() {
    return this._accessor;
  }

  /*Get the pivot columns for this relationship.*/
  public getPivotColumns() {
    return this._pivotColumns;
  }

  /*Qualify the given column name by the pivot table.*/
  public qualifyPivotColumn(column: string) {
    return column.includes('.') ? column : `${this._table}.${column}`;
  }
}

// @ts-ignore
Relation.BelongsToMany = BelongsToMany;
