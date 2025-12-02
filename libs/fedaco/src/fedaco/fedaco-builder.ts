/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isAnyEmpty, isArray, isBlank, isFunction, isNumber, isObject, isString } from '@gradii/nanofn';
import { nth, omit, pluck } from 'ramda';
import { wrap } from '../helper/arr';
import type { Constructor } from '../helper/constructor';
import { pascalCase } from '@gradii/nanofn';
import type { BuildQueries, BuildQueriesCtor } from '../query-builder/mixins/build-query';
import { mixinBuildQueries } from '../query-builder/mixins/build-query';
import type { QueryBuilder } from '../query-builder/query-builder';
import type { SqlNode } from '../query/sql-node';
import { BaseModel } from './base-model';
import type { FedacoBuilderCallBack, RelationCallBack } from './fedaco-types';
import type { ForwardCallToQueryBuilder, ForwardCallToQueryBuilderCtor } from './mixins/forward-call-to-query-builder';
import { mixinForwardCallToQueryBuilder } from './mixins/forward-call-to-query-builder';
import type { GuardsAttributes } from './mixins/guards-attributes';
import { mixinGuardsAttributes } from './mixins/guards-attributes';
import type { QueriesRelationships } from './mixins/queries-relationships';
import { mixinQueriesRelationships } from './mixins/queries-relationships';
import type { Model } from './model';
import { Relation } from './relations/relation';
import { Scope } from './scope';
import { BelongsToManySymbol, FedacoBuilderSymbol } from '../symbol/fedaco-symbol';

export interface FedacoBuilder<T extends Model = Model> extends GuardsAttributes, QueriesRelationships,
  Omit<BuildQueries, 'first' | 'latest' | 'oldest' | 'orWhere' | 'where'>,
  ForwardCallToQueryBuilder {
  first(columns?: any[] | string): Promise<T>;

  /*Create and return an un-saved model instance.*/
  make(attributes: Record<string, any>): T;

  /*Register a new global scope.*/
  withGlobalScope(identifier: string, scope: Scope | FedacoBuilderCallBack): this;

  /*Remove a registered global scope.*/
  withoutGlobalScope(scope: string): this;

  /*Remove all or passed registered global scopes.*/
  withoutGlobalScopes(scopes?: any[] | null): this;

  /*Get an array of global scopes that were removed from the query.*/
  removedScopes(): any[];

  /**
   * Add a where clause on the primary key to the query.
   */
  whereKey(id: any): this;

  /*Add a where clause on the primary key to the query.*/
  whereKeyNot(id: any): this;

  /**
   * Add a basic where clause to the query.
   */
  where(column: FedacoBuilderCallBack | any[] | SqlNode | any): this;

  where(column: string | SqlNode | any, value: any): this;

  where(column: FedacoBuilderCallBack | string | any[] | SqlNode | any, operator?: any, value?: any,
        conjunction?: string): this;

  /*Add a basic where clause to the query, and return the first result.*/
  firstWhere(column: FedacoBuilderCallBack | string | any[] | SqlNode, operator?: any, value?: any,
             conjunction?: string): Promise<T>;

  /*Add an "or where" clause to the query.*/
  orWhere(column: FedacoBuilderCallBack | any[] | string | SqlNode, operator?: any,
          value?: any): this;

  /*Add an "order by" clause for a timestamp to the query.*/
  latest(column?: string): this;

  /*Add an "order by" clause for a timestamp to the query.*/
  oldest(column?: string): this;

  /*Create a collection of models from plain arrays.*/
  hydrate(items: any[]): T[];

  /*Create a collection of models from a raw query.*/
  fromQuery(query: string, bindings?: any[]): Promise<T[]>;

  /**
   * Find a model by its primary key.
   */
  find(id: string | number, columns?: any[]): Promise<T>;

  find(id: any, columns?: any[]): Promise<T>;

  find(id: any[], columns?: any[]): Promise<T[]>;

  /**
   * Find multiple models by their primary keys.
   */
  findMany(ids: any[], columns?: any[]): Promise<T[]>;

  /*Find a model by its primary key or throw an exception.*/
  findOrFail<P extends (any[] | any)>(id: P, columns?: any[]): Promise<P extends any[] ? T[] : T>;

  /*Find a model by its primary key or return fresh model instance.*/
  findOrNew(id: any, columns?: any[]): Promise<T>;

  /*Get the first record matching the attributes or instantiate it.*/
  firstOrNew(attributes: any, values?: any): Promise<T>;

  /*Get the first record matching the attributes or create it.*/
  firstOrCreate(attributes: any, values?: any): Promise<T>;

  /*Create or update a record matching the attributes, and fill it with values.*/
  updateOrCreate(attributes: any, values: Record<string, any>): Promise<T>;

  /*Execute the query and get the first result or throw an exception.*/
  firstOrFail(columns?: any[]): Promise<T>;

  /*Execute the query and get the first result or call a callback.*/
  firstOr(columns?: FedacoBuilderCallBack | any[],
          callback?: FedacoBuilderCallBack | null): Promise<T>;

  /*Get a single column's value from the first result of a query.*/
  value<K extends keyof T>(column: K): Promise<T[K] | void>;

  /**
   * Execute the query as a "select" statement.
   */
  get(columns?: string[] | string): Promise<T[]>;

  /*Get the hydrated models without eager loading.*/
  getModels(columns?: any[] | string): Promise<T[]>;

  /*Eager load the relationships for the models.*/
  eagerLoadRelations(models: any[]): Promise<T[]>;

  /*Eagerly load the relationship on a set of models.*/
  _eagerLoadRelation(models: any[], name: string,
                     constraints: FedacoBuilderCallBack): Promise<T[]>;

  /*Get the relation instance for the given relation name.*/
  getRelation(name: string): Relation;

  /*Get the deeply nested relations for a given top-level relation.*/
  _relationsNestedUnder(relation: string): Record<string, any>;

  /*Determine if the relationship is nested.*/
  _isNestedUnder(relation: string, name: string): boolean;

  /*Add a generic "order by" clause if the query doesn't already have one.*/
  // _enforceOrderBy();

  /*Get an array with the values of a given column.*/
  pluck(column: string, key?: string): Promise<any[]>;

  /*Paginate the given query.*/
  paginate(page?: number, pageSize?: number, columns?: any[]): Promise<{
    items: any[];
    total: number;
    pageSize: number;
    page: number;
  }>;

  /*Paginate the given query into a simple paginator.*/
  simplePaginate(page?: number, pageSize?: number,
                 columns?: any[]): Promise<{ items: any[], pageSize: number, page: number }>;

  /*Save a new model and return the instance.*/
  create<T extends Model>(attributes?: Record<string, any>): Promise<T>;

  /*Save a new model and return the instance. Allow mass-assignment.*/
  forceCreate<T extends Model>(attributes: Record<string, any>): Promise<T>;

  /*Update records in the database.*/
  update(values: any): Promise<any>;

  /*Insert new records or update the existing ones.*/
  upsert(values: any[] | any, uniqueBy: any[] | string, update?: any[] | any): Promise<any>;

  /*Increment a column's value by a given amount.*/
  increment(column: string, amount?: number, extra?: any): Promise<any>;

  /*Decrement a column's value by a given amount.*/
  decrement(column: string, amount?: number, extra?: any): Promise<any>;

  /*Add the "updated at" column to an array of values.*/
  _addUpdatedAtColumn(values: any): Record<string, any>;

  /*Add timestamps to the inserted values.*/
  // _addTimestampsToUpsertValues(values: any[]);

  /*Add the "updated at" column to the updated columns.*/
  // _addUpdatedAtToUpsertColumns(update: string[]);

  /*Delete records from the database.*/
  delete(): Promise<any>;

  /*Run the default delete function on the builder.

  Since we do not apply scopes here, the row will actually be deleted.*/
  forceDelete(): Promise<boolean>;

  /*Register a replacement for the default delete function.*/
  onDelete(callback: FedacoBuilderCallBack): void;

  /*Determine if the given model has a scope.*/
  hasNamedScope(scope: string): boolean;

  /*Call the given local model scopes.*/
  scopes(scopes: any[] | string): this;

  /*Apply the scopes to the Eloquent builder instance and return it.*/
  applyScopes(): FedacoBuilder<T>;

  /*Apply the given scope on the current builder instance.*/
  callScope(scope: (...args: any[]) => any | void, parameters?: any[]): any | void;

  /*Apply the given named scope on the current builder instance.*/
  callNamedScope(scope: string, parameters?: any[]): any | void;

  /*Nest where conditions by slicing them at the given where count.*/
  _addNewWheresWithinGroup(query: QueryBuilder, originalWhereCount: number): void;

  /*Slice where conditions at the given offset and add them to the query as a nested condition.*/
  _groupWhereSliceForScope(query: QueryBuilder, whereSlice: any[]): void;

  /*Create a where array with nested where conditions.*/

  // _createNestedWhere(whereSlice: any[], conjunction?);

  pipe(...args: any[]): this;

  scope(scopeFn: string, ...args: any[]): this;

  whereScope(key: string, ...args: any[]): this;

  with(...relations: Array<{
    [key: string]: RelationCallBack;
  } | string>): this;

  with(relations: {
    [key: string]: RelationCallBack;
  }): this;

  with(relations: string[]): this;

  with(relations: string, callback?: RelationCallBack): this;

  with(relations: {
    [key: string]: RelationCallBack;
  } | string[] | string, callback?: RelationCallBack | {
    [key: string]: RelationCallBack;
  } | string): this;

  /*Prevent the specified relations from being eager loaded.*/
  without(relations: any): this;

  /*Set the relationships that should be eager loaded while removing any previously added eager loading specifications.*/
  withOnly(relations: any): this;

  /*Create a new instance of the model being queried.*/
  newModelInstance(attributes?: Record<string, any>): T;

  /*Parse a list of relations into individuals.*/
  _parseWithRelations(relations: any[]): {
    [key: string]: FedacoBuilderCallBack;
  };

  /*Create a constraint to select the given columns for the relation.*/
  _createSelectWithConstraint(name: string): [string, FedacoBuilderCallBack];

  /*Parse the nested relationships in a relation.*/
  _addNestedWiths(name: string,
                  results: Record<string, FedacoBuilderCallBack>): Record<string, FedacoBuilderCallBack>;

  /*Apply query-time casts to the model instance.*/
  withCasts(casts: any): this;

  /*Get the underlying query builder instance.*/
  getQuery(): QueryBuilder;

  /*Set the underlying query builder instance.*/
  setQuery(query: QueryBuilder): this;

  /*Get a base query builder instance.*/
  toBase(): QueryBuilder;

  /*Get the relationships being eagerly loaded.*/
  getEagerLoads(): { [key: string]: FedacoBuilderCallBack };

  /*Set the relationships being eagerly loaded.*/
  setEagerLoads(eagerLoad: any): this;

  /*Get the default key name of the table.*/
  _defaultKeyName(): string;

  /*Get the model instance being queried.*/
  getModel(): T;

  /*Set a model instance for the model being queried.*/
  setModel(model: T): this;

  /*Qualify the given column name by the model's table.*/
  qualifyColumn(column: string): string;

  /*Qualify the given columns with the model's table.*/
  qualifyColumns(columns: any[]): string[];
}

export class FedacoBuilder<T extends Model = Model> extends mixinGuardsAttributes(
  mixinQueriesRelationships(
    mixinBuildQueries(
      mixinForwardCallToQueryBuilder(class {
      })
    ) as Constructor<Omit<BuildQueriesCtor & ForwardCallToQueryBuilderCtor, 'first'>>
  )) {

  /*All of the globally registered builder macros.*/
  protected static macros: any[] = [];
  /*The model being queried.*/
  protected _model: T;
  /*The relationships that should be eager loaded.*/
  protected _eagerLoad: { [key: string]: FedacoBuilderCallBack } = {};
  /*All of the locally registered builder macros.*/
  protected _localMacros: any[] = [];
  /*A replacement for the typical delete function.*/
  protected _onDelete: (builder: FedacoBuilder) => any;
  /*The methods that should be returned from query builder.*/
  // protected _passthru: any[] = [
  //   'insert', 'insertOrIgnore', 'insertGetId', 'insertUsing', 'getBindings',
  //   'toSql', 'dump', 'dd', 'exists', 'doesntExist',
  //   'count', 'min', 'max', 'avg', 'average', 'sum', 'getConnection', 'raw',
  //   'getGrammar'
  // ];
  /*Applied global scopes.*/
  protected _scopes: any = {};
  /*Removed global scopes.*/
  protected _removedScopes: any[] = [];


  public constructor(protected _query: QueryBuilder) {
    super();
  }

  /*Create and return an un-saved model instance.*/
  public make(attributes: Record<string, any>): T {
    return this.newModelInstance(attributes);
  }

  /*Register a new global scope.*/
  public withGlobalScope(identifier: string, scope: Scope | FedacoBuilderCallBack): this {
    this._scopes[identifier] = scope;
    if (isObject(scope) && 'extend' in scope) {
      // @ts-ignore
      scope.extend(this);
    }
    return this;
  }

  /*Remove a registered global scope.*/
  public withoutGlobalScope(scope: string): this {
    delete this._scopes[scope];
    this._removedScopes.push(scope);
    return this;
  }

  /*Remove all or passed registered global scopes.*/
  public withoutGlobalScopes(scopes: any[] | null = null) {
    if (!isArray(scopes)) {
      scopes = Object.keys(this._scopes);
    }
    for (const scope of scopes) {
      this.withoutGlobalScope(scope);
    }
    return this;
  }

  /*Get an array of global scopes that were removed from the query.*/
  public removedScopes(): any[] {
    return this._removedScopes;
  }

  /**
   * Add a where clause on the primary key to the query.
   */
  public whereKey(id: any): this {
    if (id instanceof BaseModel) {
      id = (id as Model).GetKey();
    }
    if (isArray(id)) {
      this._query.whereIn(this._model.GetQualifiedKeyName(), id);
      return this;
    }
    if (id != null && this._model.GetKeyType() === 'string') {
      id = `${id}`;
    }
    return this.where(this._model.GetQualifiedKeyName(), '=', id);
  }

  /*Add a where clause on the primary key to the query.*/
  public whereKeyNot(id: any) {
    if (id instanceof BaseModel) {
      id = (id as Model).GetKey();
    }
    if (isArray(id)) {
      this._query.whereNotIn(this._model.GetQualifiedKeyName(), id);
      return this;
    }
    if (id !== null && this._model.GetKeyType() === 'string') {
      id = `${id}`;
    }
    return this.where(this._model.GetQualifiedKeyName(), '!=', id);
  }


  /**
   * Add a basic where clause to the query.
   */
  public where(query: (q: FedacoBuilder) => void): this;
  public where(column: FedacoBuilderCallBack | any[] | SqlNode | any): this;
  public where(column: string | SqlNode | any, value: any): this;
  public where(column: FedacoBuilderCallBack | string | any[] | SqlNode | any,
               operator?: any, value?: any, conjunction?: string): this;
  public where(column: FedacoBuilderCallBack | string | any[] | SqlNode | any,
               operator?: any,
               value?: any, conjunction = 'and'): this {
    if (arguments.length === 2) {
      value    = operator;
      operator = '=';
    }
    if (isFunction(column) && isBlank(operator)) {
      const query = this._model.NewQueryWithoutRelationships();
      column(query);
      this._query.addNestedWhereQuery(query.getQuery(), conjunction);
    } else {
      this._query.where(column as any[] | any, operator, value, conjunction);
    }
    return this;
  }

  /*Add a basic where clause to the query, and return the first result.*/
  public firstWhere(column: FedacoBuilderCallBack | string | any[] | SqlNode,
                    operator: any = null,
                    value: any    = null,
                    conjunction   = 'and'): Promise<T> {
    return this.where(column, operator, value, conjunction).first();
  }

  /*Add an "or where" clause to the query.*/
  public orWhere(column: FedacoBuilderCallBack | any[] | string | SqlNode,
                 operator: any = null,
                 value: any    = null): this {
    [value, operator] = this._query._prepareValueAndOperator(value, operator,
      arguments.length === 2);
    return this.where(column, operator, value, 'or');
  }

  /*Add an "order by" clause for a timestamp to the query.*/
  public latest(column?: string): this {
    if (isBlank(column)) {
      column = this._model.GetCreatedAtColumn() ?? 'created_at';
    }
    this._query.latest(column);
    return this;
  }

  /*Add an "order by" clause for a timestamp to the query.*/
  public oldest(column?: string): this {
    if (isBlank(column)) {
      column = this._model.GetCreatedAtColumn() ?? 'created_at';
    }
    this._query.oldest(column);
    return this;
  }

  /*Create a collection of models from plain arrays.*/
  public hydrate(items: any[]): T[] {
    const instance = this.newModelInstance();
    return instance.NewCollection(items.map(item => {
      const model = instance.NewFromBuilder(item);
      if (items.length > 1) {
        // model.preventsLazyLoading = Model.preventsLazyLoading();
      }
      return model;
    }));
  }

  /*Create a collection of models from a raw query.*/
  public async fromQuery(query: string, bindings: any[] = []): Promise<T[]> {
    return this.hydrate(await this._query.getConnection().select(query, bindings));
  }

  public find(id: any, columns: any[]): Promise<T>;
  public find(id: any[], columns: any[]): Promise<T[]>;
  /**
   * Find a model by its primary key.
   */
  public find(id: any | any[], columns: any[] = ['*']): Promise<T | T[]> {
    if (isArray(id)) {
      return this.findMany(id, columns);
    }
    return this.whereKey(id).first(columns);
  }

  /**
   * Find multiple models by their primary keys.
   */
  public async findMany(ids: any[], columns: any[] = ['*']): Promise<T[]> {
    if (isAnyEmpty(ids)) {
      return [];
    }
    return await this.whereKey(ids).get(columns);
  }

  /*Find a model by its primary key or throw an exception.*/
  public findOrFail(id: any, columns: any[]): Promise<T>;
  public findOrFail(id: any[], columns: any[]): Promise<T[]>;
  public async findOrFail(id: any | any[], columns: any[] = ['*']): Promise<T | T[]> {
    const result = await this.find(id, columns);

    if (isArray(id) && isArray(result)) {
      if (result.length === id.length) {
        return result;
      }
    } else if (!isBlank(result)) {
      return result;
    }
    throw new Error(
      `ModelNotFoundException No query results for model [${this._model.constructor.name}] ${JSON.stringify(
        id)}`);
  }

  /*Find a model by its primary key or return fresh model instance.*/
  public async findOrNew(id: any, columns: any[] = ['*']): Promise<T> {
    const model = await this.find(id, columns) as T;
    if (!isBlank(model)) {
      return model;
    }
    return this.newModelInstance();
  }

  /*Get the first record matching the attributes or instantiate it.*/
  public async firstOrNew(attributes: any, values: any = {}): Promise<T> {
    const instance = await this.where(attributes).first() as T;
    if (!isBlank(instance)) {
      return instance;
    }
    return this.newModelInstance({...attributes, ...values});
  }

  /*Get the first record matching the attributes or create it.*/
  public async firstOrCreate(attributes: any, values: any = {}): Promise<T> {
    let instance = await this.where(attributes).first() as T;
    if (!isBlank(instance)) {
      return instance;
    }
    instance = this.newModelInstance({...attributes, ...values});
    await instance.Save();
    return instance;
  }

  /*Create or update a record matching the attributes, and fill it with values.*/
  public async updateOrCreate(attributes: any, values: Record<string, any>): Promise<T> {
    const instance = await this.firstOrNew(attributes);
    await instance.Fill(values).Save();
    return instance;
  }

  /*Execute the query and get the first result or throw an exception.*/
  public async firstOrFail(columns: any[] = ['*']): Promise<T> {
    const model = await this.first(columns);
    if (!isBlank(model)) {
      // @ts-ignore
      return model;
    }
    throw new Error(
      `ModelNotFoundException No query results for model [${this._model.constructor.name}];`);
  }

  /*Execute the query and get the first result or call a callback.*/
  public async firstOr(columns: FedacoBuilderCallBack | any[] = ['*'],
                       callback: FedacoBuilderCallBack | null = null): Promise<T> {
    if (isFunction(columns)) {
      callback = columns;
      columns  = ['*'];
    }
    const model = await this.first(columns);
    if (!isBlank(model)) {
      return model;
    }
    return callback();
  }

  // /*Execute the query and get the first result if it's the sole matching record.*/
  // public sole(columns: any[] | string = ['*']) {
  //   try {
  //     return this.baseSole(columns);
  //   } catch (exception: RecordsNotFoundException) {
  //     throw new ModelNotFoundException().setModel(get_class(this.model));
  //   }
  // }

  /*Get a single column's value from the first result of a query.*/
  public async value<K extends keyof T>(column: K): Promise<T[K] | void> {
    const result: T = await this.first([column]) as T;
    if (result) {
      return result[column];
    }
  }

  /**
   * Execute the query as a "select" statement.
   */
  public async get(columns: string[] | string = ['*']): Promise<T[]> {
    const builder = this.applyScopes();
    let models    = await builder.getModels(columns);
    if (models.length > 0) {
      models = await builder.eagerLoadRelations(models);
    }
    // @ts-ignore
    return models;
  }

  /*Get the hydrated models without eager loading.*/
  public async getModels(columns: any[] | string = ['*']): Promise<T[]> {
    // @ts-ignore
    return this._model.NewQuery().hydrate(await this._query.get(columns));
  }

  /*Eager load the relationships for the models.*/
  public async eagerLoadRelations(models: any[]): Promise<T[]> {
    for (const [name, constraints] of Object.entries(this._eagerLoad)) {
      // For nested eager loads we'll skip loading them here and they will be set as an
      // eager load on the query to retrieve the relation so that they will be eager
      // loaded on that query, because that is where they get hydrated as models.
      if (!name.includes('.')) {
        models = await this._eagerLoadRelation(models, name, constraints);
      }
    }
    return models;
  }

  /*Eagerly load the relationship on a set of models.*/
  async _eagerLoadRelation(models: any[], name: string,
                           constraints: FedacoBuilderCallBack): Promise<T[]> {
    const relation = this.getRelation(name);
    relation.addEagerConstraints(models);
    constraints(relation);
    // @ts-ignore
    return relation.match(relation.initRelation(models, name), await relation.getEager(), name);
  }

  /*Get the relation instance for the given relation name.*/
  public getRelation(name: string): Relation {
    // We want to run a relationship query without any constrains so that we will
    // not have to remove these where clauses manually which gets really hacky
    // and error prone. We don't want constraints because we add eager ones.
    const relation = Relation.noConstraints(() => {
      const _relation = this.getModel().NewInstance().NewRelation(name);
      if (!_relation) {
        throw new Error(`RelationNotFoundException ${this.getModel().constructor.name} ${name}`); // (this.getModel(), name);
      }
      return _relation;
    });

    const nested = this._relationsNestedUnder(name);

    // If there are nested relationships set on the query, we will put those onto
    // the query instances so that they can be handled after this relationship
    // is loaded. In this way they will all trickle down as they are loaded.
    if (!isAnyEmpty(nested)) {
      relation.getQuery().with(nested);
    }
    return relation;
  }

  /*Get the deeply nested relations for a given top-level relation.*/
  _relationsNestedUnder(relation: string): Record<string, any> {
    const nested: any = {};
    for (const [name, constraints] of Object.entries(this._eagerLoad)) {
      if (this._isNestedUnder(relation, name)) {
        nested[name.substr((relation + '.').length)] = constraints;
      }
    }
    return nested;
  }

  /*Determine if the relationship is nested.*/
  _isNestedUnder(relation: string, name: string): boolean {
    return name.includes('.') && name.startsWith(relation + '.');
  }

  // /*Get a lazy collection for the given query.*/
  // public cursor() {
  //   return this.applyScopes().query.cursor().map(record => {
  //     return this.newModelInstance().newFromBuilder(record);
  //   });
  // }

  /*Add a generic "order by" clause if the query doesn't already have one.*/
  _enforceOrderBy() {
    if (!this._query._orders.length && !this._query._unionOrders.length) {
      this.orderBy(this._model.GetQualifiedKeyName(), 'asc');
    }
  }

  /*Get an array with the values of a given column.*/
  public async pluck(column: string, key?: string): Promise<any[] | Record<string, any>> {
    const results = await this.toBase().pluck(column, key);
    if (
      // !this._model.hasGetMutator(column) &&
      !this._model.HasCast(column) &&
      !this._model.GetDates().includes(column)
    ) {
      return results;
    }
    if (isArray(results)) {
      return results.map(value => {
        return this._model.NewFromBuilder({
          [column]: value
        })[column];
      });
    } else {
      throw new Error('not implement');
    }
  }

  /*Paginate the given query.*/
  public async paginate(page: number   = 1,
                        pageSize?: number,
                        columns: any[] = ['*'],
  ): Promise<{ items: any[], total: number, pageSize: number, page: number }> {
    pageSize      = pageSize || this._model.GetPerPage();
    const total   = await this.toBase().getCountForPagination();
    const results = total > 0 ? await this.forPage(page, pageSize).get(columns) : [];
    return {
      items: results,
      total,
      pageSize, page
    };
  }

  /*Paginate the given query into a simple paginator.*/
  public async simplePaginate(page: number   = 1,
                              pageSize?: number,
                              columns: any[] = ['*']): Promise<{ items: any[], pageSize: number, page: number }> {
    pageSize = pageSize || this._model.GetPerPage();
    this.skip((page - 1) * pageSize).take(pageSize + 1);
    const results = await this.get(columns);
    return {
      items: results,
      pageSize, page
    };
  }

  // /*Paginate the given query into a cursor paginator.*/
  // public cursorPaginate(perPage: number | null = null,
  //    columns: any[] = ['*'],
  //    cursorName: string = 'cursor',
  //    cursor: Cursor | string | null = null) {
  //   let perPage = perPage || this.model.getPerPage();
  //   return this.paginateUsingCursor(perPage, columns, cursorName, cursor);
  // }
  // /*Ensure the proper order by required for cursor pagination.*/
  // protected ensureOrderForCursorPagination(shouldReverse: boolean = false) {
  //   let orders = collect(this._query.orders);
  //   if (orders.count() === 0) {
  //     this.enforceOrderBy();
  //   }
  //   if (shouldReverse) {
  //     this._query.orders = collect(this._query.orders).map(order => {
  //       order['direction'] = order['direction'] === 'asc' ? 'desc' : 'asc';
  //       return order;
  //     }).toArray();
  //   }
  //   return collect(this._query.orders);
  // }
  /*Save a new model and return the instance.*/
  public async create(attributes?: Record<string, any>): Promise<T> {
    const instance = this.newModelInstance(attributes);
    await instance.Save();
    return instance;
  }

  /*Save a new model and return the instance. Allow mass-assignment.*/
  public async forceCreate(attributes: Record<string, any>) {
    return (this._model.constructor as typeof Model).unguarded(() => {
      return this.newModelInstance().NewQuery().create(attributes);
    });
  }

  /*Update records in the database.*/
  public async update(values: any): Promise<any> {
    return this.toBase().update(this._addUpdatedAtColumn(values));
  }

  /*Insert new records or update the existing ones.*/
  public upsert(values: any[] | any, uniqueBy?: any[] | string,
                update?: any[] | any): Promise<number> | number {
    if (!isArray(values)) {
      values = [values];
    }

    if (!values.length) {
      return 0;
    } else if (isAnyEmpty(update)) {
      return this.insert(values);
    }

    if (isBlank(update)) {
      update = Object.keys(values);
    }
    return this.toBase().upsert(this._addTimestampsToUpsertValues(values), uniqueBy,
      this._addUpdatedAtToUpsertColumns(update));
  }

  /*Increment a column's value by a given amount.*/
  public increment(column: string, amount: number = 1, extra: any = {}): Promise<any> {
    return this.toBase().increment(column, amount, this._addUpdatedAtColumn(extra));
  }

  /*Decrement a column's value by a given amount.*/
  public decrement(column: string, amount: number = 1, extra: any = {}): Promise<any> {
    return this.toBase().decrement(column, amount, this._addUpdatedAtColumn(extra));
  }

  /*Add the "updated at" column to an array of values.*/
  _addUpdatedAtColumn(values: any): Record<string, any> {
    if (!this._model.UsesTimestamps() || isBlank(this._model.GetUpdatedAtColumn())) {
      return values;
    }
    const column = this._model.GetUpdatedAtColumn();
    values       = {
      ...values,
      [column]: column in values ?
        values[column] :
        this._model.FreshTimestampString(),
    };
    // let segments            = preg_split('/\\s+as\\s+/i', this._query.from);
    // let qualifiedColumn     = end(segments) + '.' + column;
    // values[qualifiedColumn] = values[column];
    // delete values[column];
    return values;
  }

  /*Add timestamps to the inserted values.*/
  _addTimestampsToUpsertValues(values: any[]) {
    if (!this._model.UsesTimestamps()) {
      return values;
    }
    const timestamp = this._model.FreshTimestampString();
    const columns   = [
      this._model.GetCreatedAtColumn(),
      this._model.GetUpdatedAtColumn()
    ];
    for (const row of values) {
      for (const column of columns) {
        row[column] = timestamp;
      }
    }
    return values;
  }

  /*Add the "updated at" column to the updated columns.*/
  _addUpdatedAtToUpsertColumns(update: string[]) {
    if (!this._model.UsesTimestamps()) {
      return update;
    }
    const column = this._model.GetUpdatedAtColumn();
    if (!isBlank(column) && !update.includes(column)) {
      update.push(column);
    }
    return update;
  }

  /*Delete records from the database.*/
  public async delete(): Promise<any> {
    if (this._onDelete !== undefined) {
      return this._onDelete.call(this, this);
    }
    return this.toBase().delete();
  }

  /*Run the default delete function on the builder.

  Since we do not apply scopes here, the row will actually be deleted.*/
  public forceDelete(): Promise<boolean> {
    return this._query.delete();
  }

  /*Register a replacement for the default delete function.*/
  public onDelete(callback: (builder: FedacoBuilder) => any): void {
    this._onDelete = callback;
  }

  /*Determine if the given model has a scope.*/
  public hasNamedScope(scope: string): boolean {
    return this._model && this._model.HasNamedScope(scope);
  }

  /*Call the given local model scopes.*/
  public scopes(scopes: any[] | string): this {
    let builder = this;
    for (let [scope, parameters] of Object.entries(wrap(scopes))) {
      if (isNumber(scope)) {
        [scope, parameters] = [parameters, []];
      }
      builder = builder.callNamedScope(scope, wrap(parameters));
    }
    return builder;
  }

  /*Apply the scopes to the Eloquent builder instance and return it.*/
  public applyScopes(): FedacoBuilder<T> {
    if (isAnyEmpty(this._scopes)) {
      return this;
    }
    const builder = this.clone();
    for (const [identifier, scope] of Object.entries(this._scopes)) {
      if (builder._scopes[identifier] == null) {
        continue;
      }
      builder.callScope((_builder: FedacoBuilder<T>) => {
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

  /*Apply the given scope on the current builder instance.*/
  callScope(scope: (...args: any[]) => any | void, parameters: any[] = []): any | void {
    parameters.unshift(this);
    const query              = this.getQuery();
    const originalWhereCount = !query._wheres.length ? 0 : query._wheres.length;
    const result             = scope(...parameters) ?? this;
    if (/*cast type array*/ query._wheres.length > originalWhereCount) {
      this._addNewWheresWithinGroup(query, originalWhereCount);
    }
    return result;
  }

  /*Apply the given named scope on the current builder instance.*/
  callNamedScope(scope: string, parameters: any[] = []): any | void {
    return this.callScope((params: any[]) => {
      return this._model.CallNamedScope(scope, params);
    }, parameters);
  }

  /*Nest where conditions by slicing them at the given where count.*/
  _addNewWheresWithinGroup(query: QueryBuilder, originalWhereCount: number): void {
    const allWheres = query._wheres;
    query._wheres   = [];
    this._groupWhereSliceForScope(query, allWheres.slice(0, originalWhereCount));
    this._groupWhereSliceForScope(query, allWheres.slice(originalWhereCount));
  }

  /*Slice where conditions at the given offset and add them to the query as a nested condition.*/
  _groupWhereSliceForScope(query: QueryBuilder, whereSlice: any[]): void {
    const whereBooleans = pluck('boolean', whereSlice);
    if (whereBooleans.includes('or')) {
      query._wheres.push(this._createNestedWhere(whereSlice, nth(0, whereBooleans)));
    } else {
      query._wheres = [...query._wheres, ...whereSlice];
    }
  }

  /*Create a where array with nested where conditions.*/
  _createNestedWhere(whereSlice: any[], conjunction = 'and') {
    const whereGroup   = this.getQuery().forNestedWhere();
    whereGroup._wheres = whereSlice;
    return {
      'type'   : 'Nested',
      'query'  : whereGroup,
      'boolean': conjunction
    };
  }

  public pipe(...args: any[]): this {
    args.forEach(scopeFn => {
      scopeFn(this);
    });
    return this;
  }

  public scope(scopeFn: string, ...args: any[]): this {
    return this.callNamedScope(scopeFn, args);
  }

  public whereScope(key: string, ...args: any[]): this {
    const metadata = this._model._scopeInfo(`scope${pascalCase(key)}`);
    if (metadata && metadata.isScope) {
      metadata.query(this, ...args);
      return this;
    }

    throw new Error('key is not in model or scope metadata is not exist');
  }

  public with(...relations: Array<{ [key: string]: RelationCallBack } | string>): this;
  public with(relations: { [key: string]: RelationCallBack }): this;
  public with(relations: string[]): this;
  public with(relations: string, callback?: RelationCallBack): this;
  public with(relations: { [key: string]: RelationCallBack } | string[] | string,
              callback?: RelationCallBack | { [key: string]: RelationCallBack } | string): this {
    if (!relations || isArray(relations) && !relations.length) {
      return this;
    }
    let eagerLoad;
    if (isFunction(callback)) {
      eagerLoad = this._parseWithRelations([{[relations as string]: callback}]);
    } else {
      eagerLoad = this._parseWithRelations(
        isArray(relations) ? relations as any[] : [...arguments]);
    }
    this._eagerLoad = {...this._eagerLoad, ...eagerLoad};
    return this;
  }

  /*Prevent the specified relations from being eager loaded.*/
  public without(relations: any): this {
    this._eagerLoad = omit(isString(relations) ? arguments : relations,
      this._eagerLoad);
    return this;
  }

  /*Set the relationships that should be eager loaded while removing any previously added eager loading specifications.*/
  public withOnly(relations: any): this {
    this._eagerLoad = {};
    return this.with(relations);
  }

  /*Create a new instance of the model being queried.*/
  public newModelInstance(attributes?: Record<string, any>): T {
    return this._model.NewInstance(attributes).SetConnection(this._query.getConnection().getName());
  }

  /*Parse a list of relations into individuals.*/
  _parseWithRelations(relations: any[]): { [key: string]: FedacoBuilderCallBack } {
    let results: Record<string, FedacoBuilderCallBack> = {};
    for (const relation of relations) {
      if (isString(relation)) {
        const [name, constraints] = relation.includes(':') ?
          this._createSelectWithConstraint(relation) as [string, (...args: any[]) => void] :
          [
            relation, () => {
          }
          ];

        results       = this._addNestedWiths(name, results);
        results[name] = constraints;
      } else {
        for (const [name, constraints] of Object.entries(relation)) {
          this._addNestedWiths(name, results);
          results[name] = constraints as FedacoBuilderCallBack;
        }
      }
    }
    return results;
  }

  /*Create a constraint to select the given columns for the relation.*/
  _createSelectWithConstraint(name: string): [string, FedacoBuilderCallBack] {
    return [
      name.split(':')[0], (query: any) => {
        query.select(name.split(':')[1].split(',').map(column => {
          if (column.includes('.')) {
            return column;
          }
          // @ts-ignore
          return query[BelongsToManySymbol] ?
            query.getRelated().getTable() + '.' + column :
            column;
        }));
      }
    ];
  }

  /*Parse the nested relationships in a relation.*/
  _addNestedWiths(name: string,
                  results: Record<string, FedacoBuilderCallBack>): Record<string, FedacoBuilderCallBack> {
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

  /*Apply query-time casts to the model instance.*/
  public withCasts(casts: any): this {
    this._model.MergeCasts(casts);
    return this;
  }

  /*Get the underlying query builder instance.*/
  public getQuery(): QueryBuilder {
    return this._query;
  }

  /*Set the underlying query builder instance.*/
  public setQuery(query: QueryBuilder): this {
    this._query = query;
    return this;
  }

  /*Get a base query builder instance.*/
  public toBase(): QueryBuilder {
    return this.applyScopes().getQuery();
  }

  /*Get the relationships being eagerly loaded.*/
  public getEagerLoads(): { [key: string]: FedacoBuilderCallBack } {
    return this._eagerLoad;
  }

  /*Set the relationships being eagerly loaded.*/
  public setEagerLoads(eagerLoad: any): this {
    this._eagerLoad = eagerLoad;
    return this;
  }

  /*Get the default key name of the table.*/
  _defaultKeyName(): string {
    return this.getModel().GetKeyName();
  }

  /*Get the model instance being queried.*/
  public getModel(): T {
    return this._model;
  }

  /*Set a model instance for the model being queried.*/
  public setModel(model: T): this {
    this._model = model;
    this._query.from(model.GetTable());
    return this;
  }

  /*Qualify the given column name by the model's table.*/
  public qualifyColumn(column: string): string {
    return this._model.QualifyColumn(column);
  }

  /*Qualify the given columns with the model's table.*/
  public qualifyColumns(columns: any[]): string[] {
    return this._model.QualifyColumns(columns);
  }


  // /*Get the given macro by name.*/
  // public getMacro(name: string) {
  //   return Arr.get(this.localMacros, name);
  // }
  // /*Checks if a macro is registered.*/
  // public hasMacro(name: string) {
  //   return this.localMacros[name] !== undefined;
  // }
  // /*Get the given global macro by name.*/
  // public static getGlobalMacro(name: string) {
  //   return Arr.get(Builder.macros, name);
  // }
  // /*Checks if a global macro is registered.*/
  // public static hasGlobalMacro(name: string) {
  //   return Builder.macros[name] !== undefined;
  // }
  // /*Dynamically access builder proxies.*/
  // public __get(key: string) {
  //   if (key === 'orWhere') {
  //     return new HigherOrderBuilderProxy(this, key);
  //   }
  //   throw new Exception('"Property [{Key}] does not exist on the Eloquent builder instance."');
  // }
  // /*Dynamically handle calls into the query instance.*/
  // public __call(method: string, parameters: any[]) {
  //   if (method === 'macro') {
  //     this.localMacros[parameters[0]] = parameters[1];
  //     return;
  //   }
  //   if (this.hasMacro(method)) {
  //     array_unshift(parameters, this);
  //     return this.localMacros[method](());
  //   }
  //   if (Builder.hasGlobalMacro(method)) {
  //     let callable = Builder.macros[method];
  //     if (callable instanceof Closure) {
  //       let callable = callable.bindTo(this, Builder);
  //     }
  //     return callable(());
  //   }
  //   if (this.hasNamedScope(method)) {
  //     return this.callNamedScope(method, parameters);
  //   }
  //   this.forwardCallTo(this.query, method, parameters);
  //   return this;
  // }
  // /*Dynamically handle calls into the query instance.*/
  // public static __callStatic(method: string, parameters: any[]) {
  //   if (method === 'macro') {
  //     Builder.macros[parameters[0]] = parameters[1];
  //     return;
  //   }
  //   if (method === 'mixin') {
  //     return Builder.registerMixin(parameters[0], parameters[1] ?? true);
  //   }
  //   if (!Builder.hasGlobalMacro(method)) {
  //     Builder.throwBadMethodCallException(method);
  //   }
  //   let callable = Builder.macros[method];
  //   if (callable instanceof Closure) {
  //     let callable = callable.bindTo(null, Builder);
  //   }
  //   return callable(());
  // }
  // /*Register the given mixin with the builder.*/
  // protected static registerMixin(mixin: string, replace: boolean) {
  //   let methods = new ReflectionClass(mixin).getMethods(ReflectionMethod.IS_PUBLIC | ReflectionMethod.IS_PROTECTED);
  //   for (let method of methods) {
  //     if (replace || !Builder.hasGlobalMacro(method.name)) {
  //       method.setAccessible(true);
  //       Builder.macro(method.name, method.invoke(mixin));
  //     }
  //   }
  // }


  // no need to use use group
  // protected addNewWheresWithinGroup(query: FedacoBuilder, originalWhereCount: number) {
  //   const allWheres = query.wheres;
  //   query.wheres = [];
  //   this.groupWhereSliceForScope(query, array_slice(allWheres, 0, originalWhereCount));
  //   this.groupWhereSliceForScope(query, array_slice(allWheres, originalWhereCount));
  // }

  clone(): FedacoBuilder<T> {
    // return this;
    const builder      = new FedacoBuilder<T>(this._query.clone());
    builder._scopes    = {...this._scopes};
    builder._model     = this._model;
    builder._eagerLoad = {...this._eagerLoad};
    return builder;
  }

  [FedacoBuilderSymbol] = true
}
