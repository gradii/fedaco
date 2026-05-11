/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  isAnyEmpty,
  isArray,
  isBlank,
  isFunction,
  isNumber,
  isObject,
  isString,
  omit,
  pascalCase,
  pluck,
} from '@gradii/nanofn';
import { Observable } from 'rxjs';
import type { Connection } from '../connection';
import { wrap } from '../helper/arr';
import type { Constructor } from '../helper/constructor';
import { raw } from '../query-builder/ast-factory';
import type { BuildQueries, BuildQueriesCtor } from '../query-builder/mixins/build-query';
import { mixinBuildQueries } from '../query-builder/mixins/build-query';
import type { QueryBuilder } from '../query-builder/query-builder';
import type { SqlNode } from '../query/sql-node';
import { BaseModel } from './base-model';
import { Cursor } from './cursor';
import { type CursorOrderColumn, CursorPaginator } from './cursor-paginator';
import type { FedacoBuilderCallBack, RelationCallBack } from './fedaco-types';
import type { ForwardCallToQueryBuilder, ForwardCallToQueryBuilderCtor } from './mixins/forward-call-to-query-builder';
import { mixinForwardCallToQueryBuilder } from './mixins/forward-call-to-query-builder';
import type { GuardsAttributes } from './mixins/guards-attributes';
import { mixinGuardsAttributes } from './mixins/guards-attributes';
import type { QueriesRelationships } from './mixins/queries-relationships';
import { mixinQueriesRelationships } from './mixins/queries-relationships';
import type { Model } from './model';
import { Relation } from './relations/relation';
import { BaseScope } from './base-scope';
import { BelongsToManySymbol, FedacoBuilderSymbol } from '../symbol/fedaco-symbol';
import { type KeyAbleModel } from '../types/model-type';

export interface FedacoBuilder<T extends Model = Model>
  extends
    GuardsAttributes,
    QueriesRelationships,
    Omit<BuildQueries, 'first' | 'latest' | 'oldest' | 'orWhere' | 'where'>,
    ForwardCallToQueryBuilder {
  first(columns?: any[] | string): Promise<T>;

  /* Create and return an un-saved model instance. */
  make(attributes: Record<string, any>): T;

  /* Register a new global scope. */
  withGlobalScope(identifier: string, scope: BaseScope | FedacoBuilderCallBack): this;

  /* Remove a registered global scope. */
  withoutGlobalScope(scope: string): this;

  /* Remove all or passed registered global scopes. */
  withoutGlobalScopes(scopes?: any[] | null): this;

  /* Get an array of global scopes that were removed from the query. */
  removedScopes(): any[];

  /* Set the connection for this query builder instance. */
  withConnection(connection: Connection): this;

  /**
   * Add a where clause on the primary key to the query.
   */
  whereKey(id: any): this;

  /* Add a where clause on the primary key to the query. */
  whereKeyNot(id: any): this;

  /**
   * Add a basic where clause to the query.
   */
  where(column: FedacoBuilderCallBack | any[] | SqlNode | any): this;

  where(column: string | SqlNode | any, value: any): this;

  where(
    column: FedacoBuilderCallBack | string | any[] | SqlNode | any,
    operator?: any,
    value?: any,
    conjunction?: string,
  ): this;

  /* Add a basic where clause to the query, and return the first result. */
  firstWhere(
    column: FedacoBuilderCallBack | string | any[] | SqlNode,
    operator?: any,
    value?: any,
    conjunction?: string,
  ): Promise<T>;

  /* Add an "or where" clause to the query. */
  orWhere(column: FedacoBuilderCallBack | any[] | string | SqlNode, operator?: any, value?: any): this;

  /**
   * Add a basic "where not" clause to the query.
   */
  whereNot(
    column: FedacoBuilderCallBack | string | any[] | SqlNode | any,
    operator?: any,
    value?: any,
    conjunction?: 'and' | 'or',
  ): this;

  /* Add an "or where not" clause to the query. */
  orWhereNot(column: FedacoBuilderCallBack | any[] | string | SqlNode, operator?: any, value?: any): this;

  /* Add an "order by" clause for a timestamp to the query. */
  latest(column?: string): this;

  /* Add an "order by" clause for a timestamp to the query. */
  oldest(column?: string): this;

  /* Create a collection of models from plain arrays. */
  hydrate(items: any[]): T[];

  /* Insert new records into the database via the model's fill/cast pipeline. */
  fillAndInsert(values: Record<string, any>[]): Promise<any>;

  /* Insert new records, ignoring duplicates, via the model's fill/cast pipeline. */
  fillAndInsertOrIgnore(values: Record<string, any>[]): Promise<any>;

  /* Insert and return the new id, via the model's fill/cast pipeline. */
  fillAndInsertGetId(values: Record<string, any>): Promise<any>;

  /* Resolve fill/cast pipeline for a set of rows, returning the prepared rows. */
  fillForInsert(values: Record<string, any>[]): Record<string, any>[];

  /* Create a collection of models from a raw query. */
  fromQuery(query: string, bindings?: any[]): Promise<T[]>;

  /**
   * Find a model by its primary key.
   */
  find(id: string | number, columns?: any[]): Promise<T>;

  find(id: any[], columns?: any[]): Promise<T[]>;

  find(id: any, columns?: any[]): Promise<T>;

  /**
   * Find multiple models by their primary keys.
   */
  findMany(ids: any[], columns?: any[]): Promise<T[]>;

  /* Find a model by its primary key or throw an exception. */
  findOrFail<P extends any[] | any>(id: P, columns?: any[]): Promise<P extends any[] ? T[] : T>;

  /* Find a model by its primary key or return fresh model instance. */
  findOrNew(id: any, columns?: any[]): Promise<T>;

  /* Get the first record matching the attributes or instantiate it. */
  firstOrNew(attributes: any, values?: any): Promise<T>;

  /* Get the first record matching the attributes or create it. */
  firstOrCreate(attributes: any, values?: any): Promise<T>;

  /* Create or update a record matching the attributes, and fill it with values. */
  updateOrCreate(attributes: any, values: Record<string, any>): Promise<T>;

  /* Execute the query and get the first result or throw an exception. */
  firstOrFail(columns?: any[]): Promise<T>;

  /* Execute the query and get the first result or call a callback. */
  firstOr(columns?: FedacoBuilderCallBack | any[], callback?: FedacoBuilderCallBack | null): Promise<T>;

  /* Find a model by its primary key or call a callback. */
  findOr(id: any, columns?: any[] | FedacoBuilderCallBack, callback?: FedacoBuilderCallBack | null): Promise<T>;

  /* Find a model by its primary key, expecting exactly one match. */
  findSole(id: any, columns?: any[]): Promise<T>;

  /* Create the record matching the attributes, or read the matching record. */
  createOrFirst(attributes: any, values?: any): Promise<T>;

  /* Increment the column matching the attributes, or create a new record. */
  incrementOrCreate(attributes: any, column?: string, defaultValue?: number, step?: number, extra?: any): Promise<T>;

  /* Get a single column's value from the first result of a query. */
  value<K extends keyof T>(column: K): Promise<T[K] | void>;

  /* Execute the query and get the first result if it's the sole matching record. */
  sole(columns?: any[] | string): Promise<T>;

  /* Get a single column's value from the first result, expecting exactly one match. */
  soleValue<K extends keyof T>(column: K): Promise<T[K]>;

  /* Get a single column's value from the first result of a query, or throw. */
  valueOrFail<K extends keyof T>(column: K): Promise<T[K]>;

  /**
   * Execute the query as a "select" statement.
   */
  get(columns?: string[] | string): Promise<T[]>;

  /* Get the hydrated models without eager loading. */
  getModels(columns?: any[] | string): Promise<T[]>;

  /* Eager load the relationships for the models. */
  eagerLoadRelations(models: any[]): Promise<T[]>;

  /* Eagerly load the relationship on a set of models. */
  _eagerLoadRelation(models: any[], name: string, constraints: FedacoBuilderCallBack): Promise<T[]>;

  /* Get the relation instance for the given relation name. */
  getRelation(name: string): Relation;

  /* Get the deeply nested relations for a given top-level relation. */
  _relationsNestedUnder(relation: string): Record<string, any>;

  /* Determine if the relationship is nested. */
  _isNestedUnder(relation: string, name: string): boolean;

  /* Add a generic "order by" clause if the query doesn't already have one. */
  // _enforceOrderBy();

  /* Get an array with the values of a given column. */
  pluck(column: string, key?: string): Promise<any[]>;

  /* Paginate the given query. */
  paginate(
    page?: number,
    pageSize?: number,
    columns?: any[],
  ): Promise<{
    items: any[];
    total: number;
    pageSize: number;
    page: number;
  }>;

  /* Paginate the given query into a simple paginator. */
  simplePaginate(
    page?: number,
    pageSize?: number,
    columns?: any[],
  ): Promise<{ items: any[]; pageSize: number; page: number }>;

  /* Stream the query results model-by-model as an RxJS Observable. */
  cursor(columns?: any[] | string, chunkSize?: number): Observable<T>;

  /* Paginate the given query into a cursor paginator with an encoded cursor. */
  cursorPaginate(
    pageSize?: number,
    columns?: any[],
    cursorName?: string,
    cursor?: Cursor | string | null,
  ): Promise<CursorPaginator<T>>;

  /* Save a new model and return the instance. */
  create(attributes?: Record<string, any>): Promise<T>;

  /* Save a new model without firing any model events and return the instance. */
  createQuietly(attributes?: Record<string, any>): Promise<T>;

  /* Save a new model and return the instance. Allow mass-assignment. */
  forceCreate(attributes: Record<string, any>): Promise<T>;

  /* Save a new model without firing any events and allow mass-assignment. */
  forceCreateQuietly(attributes?: Record<string, any>): Promise<T>;

  /* Update records in the database. */
  update(values: any): Promise<any>;

  /* Update the column's updated_at timestamp on records matched by the query. */
  touch(column?: string): Promise<any>;

  /* Insert new records or update the existing ones. */
  upsert(values: any[] | any, uniqueBy: any[] | string, update?: any[] | any): Promise<any>;

  /* Increment a column's value by a given amount. */
  increment(column: string, amount?: number, extra?: any): Promise<any>;

  /* Decrement a column's value by a given amount. */
  decrement(column: string, amount?: number, extra?: any): Promise<any>;

  /* Increment each of the given columns by a given amount. */
  incrementEach(columns: Record<string, number>, extra?: any): Promise<any>;

  /* Decrement each of the given columns by a given amount. */
  decrementEach(columns: Record<string, number>, extra?: any): Promise<any>;

  /* Add the "updated at" column to an array of values. */
  _addUpdatedAtColumn(values: any): Record<string, any>;

  /* Add timestamps to the inserted values. */
  // _addTimestampsToUpsertValues(values: any[]);

  /* Add the "updated at" column to the updated columns. */
  // _addUpdatedAtToUpsertColumns(update: string[]);

  /* Delete records from the database. */
  delete(): Promise<any>;

  /* Run the default delete function on the builder.

  Since we do not apply scopes here, the row will actually be deleted. */
  forceDelete(): Promise<boolean>;

  /* Register a replacement for the default delete function. */
  onDelete(callback: FedacoBuilderCallBack): void;

  /* Determine if the given model has a scope. */
  hasNamedScope(scope: string): boolean;

  /* Call the given local model scopes. */
  scopes(scopes: any[] | string): this;

  /* Apply the scopes to the Eloquent builder instance and return it. */
  applyScopes(): FedacoBuilder<T>;

  /* Apply the given scope on the current builder instance. */
  callScope(scope: (...args: any[]) => any | void, parameters?: any[]): any | void;

  /* Apply the given named scope on the current builder instance. */
  callNamedScope(scope: string, parameters?: any[]): any | void;

  /* Nest where conditions by slicing them at the given where count. */
  _addNewWheresWithinGroup(query: QueryBuilder, originalWhereCount: number): void;

  /* Slice where conditions at the given offset and add them to the query as a nested condition. */
  _groupWhereSliceForScope(query: QueryBuilder, whereSlice: any[]): void;

  /* Create a where array with nested where conditions. */

  // _createNestedWhere(whereSlice: any[], conjunction?);

  pipe(...args: any[]): this;

  scope(scopeFn: string, ...args: any[]): this;

  whereScope(key: string, ...args: any[]): this;

  with(
    ...relations: Array<
      | {
          [key: string]: RelationCallBack;
        }
      | string
    >
  ): this;

  with(relations: { [key: string]: RelationCallBack }): this;

  with(relations: string[]): this;

  with(relations: string, callback?: RelationCallBack): this;

  with(
    relations:
      | {
          [key: string]: RelationCallBack;
        }
      | string[]
      | string,
    callback?:
      | RelationCallBack
      | {
          [key: string]: RelationCallBack;
        }
      | string,
  ): this;

  /* Prevent the specified relations from being eager loaded. */
  without(relations: any): this;

  /* Alias of without() — remove the given relations from the eager-load set. */
  withoutEagerLoad(relations: any): this;

  /* Clear all eager-loaded relations. */
  withoutEagerLoads(): this;

  /* Set the relationships that should be eager loaded while removing any previously added eager loading specifications. */
  withOnly(relations: any): this;

  /* Create a new instance of the model being queried. */
  newModelInstance(attributes?: Record<string, any>): T;

  /* Parse a list of relations into individuals. */
  _parseWithRelations(relations: any[]): {
    [key: string]: FedacoBuilderCallBack;
  };

  /* Create a constraint to select the given columns for the relation. */
  _createSelectWithConstraint(name: string): [string, FedacoBuilderCallBack];

  /* Parse the nested relationships in a relation. */
  _addNestedWiths(name: string, results: Record<string, FedacoBuilderCallBack>): Record<string, FedacoBuilderCallBack>;

  /* Apply query-time casts to the model instance. */
  withCasts(casts: any): this;

  /* Register a callback to be invoked after the query is run. */
  afterQuery(callback: (result: any) => any): this;

  /* Invoke registered after-query callbacks against the given result. */
  applyAfterQueryCallbacks(result: any): any;

  /* Add default attributes to new model instances and (optionally) as where conditions. */
  withAttributes(attributes: Record<string, any> | string, value?: any, asConditions?: boolean): this;

  /* Get the underlying query builder instance. */
  getQuery(): QueryBuilder;

  /* Set the underlying query builder instance. */
  setQuery(query: QueryBuilder): this;

  /* Get a base query builder instance. */
  toBase(): QueryBuilder;

  /* Get the relationships being eagerly loaded. */
  getEagerLoads(): { [key: string]: FedacoBuilderCallBack };

  /* Set the relationships being eagerly loaded. */
  setEagerLoads(eagerLoad: any): this;

  /* Get the default key name of the table. */
  _defaultKeyName(): string;

  /* Get the model instance being queried. */
  getModel(): T;

  /* Set a model instance for the model being queried. */
  setModel(model: T): this;

  /* Qualify the given column name by the model's table. */
  qualifyColumn(column: string): string;

  /* Qualify the given columns with the model's table. */
  qualifyColumns(columns: any[]): string[];

  /* Clone the Eloquent query builder. */
  clone(): FedacoBuilder<T>;

  /* Register a closure to be invoked when the builder is cloned. */
  onClone(callback: (builder: FedacoBuilder<T>) => void): this;
}

export class FedacoBuilder<T extends Model = Model> extends mixinGuardsAttributes(
  mixinQueriesRelationships(
    mixinBuildQueries(mixinForwardCallToQueryBuilder(class {})) as Constructor<
      Omit<BuildQueriesCtor & ForwardCallToQueryBuilderCtor, 'first'>
    >,
  ),
) {
  /* All of the globally registered builder macros. */
  protected static macros: any[] = [];
  /* The model being queried. */
  protected _model: T;
  /* The relationships that should be eager loaded. */
  protected _eagerLoad: { [key: string]: FedacoBuilderCallBack } = {};
  /* All of the locally registered builder macros. */
  protected _localMacros: any[] = [];
  /* A replacement for the typical delete function. */
  protected _onDelete: (builder: FedacoBuilder) => any;
  /* The methods that should be returned from query builder. */
  // protected _passthru: any[] = [
  //   'insert', 'insertOrIgnore', 'insertGetId', 'insertUsing', 'getBindings',
  //   'toSql', 'dump', 'dd', 'exists', 'doesntExist',
  //   'count', 'min', 'max', 'avg', 'average', 'sum', 'getConnection', 'raw',
  //   'getGrammar'
  // ];
  /* Applied global scopes. */
  protected _scopes: any = {};
  /* Removed global scopes. */
  protected _removedScopes: any[] = [];
  /* The callbacks to be invoked on the builder clone. */
  protected _onCloneCallbacks: Array<(builder: FedacoBuilder<any>) => void> = [];
  /* Attributes to be applied to new model instances created via this builder. */
  protected _pendingAttributes: Record<string, any> = {};
  /* Callbacks run after a query result is produced. */
  protected _afterQueryCallbacks: Array<(result: any) => any> = [];

  public constructor(protected _query: QueryBuilder) {
    super();
  }

  /* Create and return an un-saved model instance. */
  public make(attributes: Record<string, any>): T {
    return this.newModelInstance(attributes);
  }

  /* Register a new global scope. */
  public withGlobalScope(identifier: string, scope: BaseScope | FedacoBuilderCallBack): this {
    this._scopes[identifier] = scope;
    if (isObject(scope) && 'extend' in scope) {
      // @ts-ignore
      scope.extend(this);
    }
    return this;
  }

  /* Remove a registered global scope. */
  public withoutGlobalScope(scope: string): this {
    delete this._scopes[scope];
    this._removedScopes.push(scope);
    return this;
  }

  /* Remove all or passed registered global scopes. */
  public withoutGlobalScopes(scopes: any[] | null = null) {
    if (!isArray(scopes)) {
      scopes = Object.keys(this._scopes);
    }
    for (const scope of scopes) {
      this.withoutGlobalScope(scope);
    }
    return this;
  }

  /* Get an array of global scopes that were removed from the query. */
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

  /* Add a where clause on the primary key to the query. */
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
  public where(
    column: FedacoBuilderCallBack | string | any[] | SqlNode | any,
    operator?: any,
    value?: any,
    conjunction?: string,
  ): this;
  public where(
    column: FedacoBuilderCallBack | string | any[] | SqlNode | any,
    operator?: any,
    value?: any,
    conjunction = 'and',
  ): this {
    if (arguments.length === 2) {
      value = operator;
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

  /* Add a basic where clause to the query, and return the first result. */
  public firstWhere(
    column: FedacoBuilderCallBack | string | any[] | SqlNode,
    operator: any = null,
    value: any = null,
    conjunction = 'and',
  ): Promise<T> {
    return this.where(column, operator, value, conjunction).first();
  }

  /* Add an "or where" clause to the query. */
  public orWhere(
    column: FedacoBuilderCallBack | any[] | string | SqlNode,
    operator: any = null,
    value: any = null,
  ): this {
    [value, operator] = this._query._prepareValueAndOperator(value, operator, arguments.length === 2);
    return this.where(column, operator, value, 'or');
  }

  /* Add a basic "where not" clause to the query. */
  public whereNot(
    column: FedacoBuilderCallBack | string | any[] | SqlNode | any,
    operator: any = null,
    value: any = null,
    conjunction: 'and' | 'or' = 'and',
  ): this {
    if (arguments.length === 2) {
      value = operator;
      operator = '=';
    }
    if (isFunction(column) && isBlank(operator)) {
      const query = this._model.NewQueryWithoutRelationships();
      column(query);
      this._query.addNestedWhereQuery(query.getQuery(), conjunction === 'or' ? 'or not' : 'and not');
    } else {
      this._query.whereNot(column as any[] | any, operator, value, conjunction);
    }
    return this;
  }

  /* Add an "or where not" clause to the query. */
  public orWhereNot(
    column: FedacoBuilderCallBack | any[] | string | SqlNode,
    operator: any = null,
    value: any = null,
  ): this {
    [value, operator] = this._query._prepareValueAndOperator(value, operator, arguments.length === 2);
    return this.whereNot(column, operator, value, 'or');
  }

  /* Add an "order by" clause for a timestamp to the query. */
  public latest(column?: string): this {
    if (isBlank(column)) {
      column = this._model.GetCreatedAtColumn() ?? 'created_at';
    }
    this._query.latest(column);
    return this;
  }

  /* Add an "order by" clause for a timestamp to the query. */
  public oldest(column?: string): this {
    if (isBlank(column)) {
      column = this._model.GetCreatedAtColumn() ?? 'created_at';
    }
    this._query.oldest(column);
    return this;
  }

  /* Create a collection of models from plain arrays. */
  public hydrate(items: any[]): T[] {
    const instance = this.newModelInstance();
    return instance.NewCollection(
      items.map((item) => {
        const model = instance.NewFromBuilder(item);
        if (items.length > 1) {
          // model.preventsLazyLoading = Model.preventsLazyLoading();
        }
        return model;
      }),
    );
  }

  /* Create a collection of models from a raw query. */
  public async fromQuery(query: string, bindings: any[] = []): Promise<T[]> {
    return this.hydrate(await this._query.getConnection().select(query, bindings));
  }

  /* Insert new records into the database, running attributes through the model's fill/cast pipeline. */
  public async fillAndInsert(values: Record<string, any>[]): Promise<any> {
    return this.insert(this.fillForInsert(values));
  }

  /* Insert new records (or ignore on duplicate) via the model's fill/cast pipeline. */
  public async fillAndInsertOrIgnore(values: Record<string, any>[]): Promise<any> {
    return this.insertOrIgnore(this.fillForInsert(values));
  }

  /* Insert a new record via the model's fill/cast pipeline and return its id. */
  public async fillAndInsertGetId(values: Record<string, any>): Promise<any> {
    return this.insertGetId(this.fillForInsert([values])[0]);
  }

  /* Run a set of rows through the model's fill/cast pipeline for insertion. */
  public fillForInsert(values: Record<string, any>[]): Record<string, any>[] {
    if (!values.length) {
      return values;
    }
    const usesTimestamps = this._model.UsesTimestamps();
    const timestamp = usesTimestamps ? this._model.FreshTimestampString() : null;
    const createdAtColumn = usesTimestamps ? this._model.GetCreatedAtColumn() : null;
    const updatedAtColumn = usesTimestamps ? this._model.GetUpdatedAtColumn() : null;

    return values.map((row) => {
      const instance = this.newModelInstance().Fill(row) as T;
      const attributes = instance.GetAttributes();
      if (usesTimestamps) {
        if (createdAtColumn && !(createdAtColumn in attributes)) {
          attributes[createdAtColumn] = timestamp;
        }
        if (updatedAtColumn && !(updatedAtColumn in attributes)) {
          attributes[updatedAtColumn] = timestamp;
        }
      }
      return attributes;
    });
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

  /* Find a model by its primary key or throw an exception. */
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
      `ModelNotFoundException No query results for model [${this._model.constructor.name}] ${JSON.stringify(id)}`,
    );
  }

  /* Find a model by its primary key or return fresh model instance. */
  public async findOrNew(id: any, columns: any[] = ['*']): Promise<T> {
    const model = (await this.find(id, columns)) as T;
    if (!isBlank(model)) {
      return model;
    }
    return this.newModelInstance();
  }

  /* Find a model by its primary key or call a callback. */
  public async findOr(
    id: any,
    columns: any[] | FedacoBuilderCallBack = ['*'],
    callback: FedacoBuilderCallBack | null = null,
  ): Promise<T> {
    if (isFunction(columns)) {
      callback = columns;
      columns = ['*'];
    }
    const model = await this.find(id, columns as any[]);
    if (!isBlank(model)) {
      return model as T;
    }
    return callback();
  }

  /* Find a model by its primary key, expecting exactly one match. */
  public async findSole(id: any, columns: any[] = ['*']): Promise<T> {
    return this.whereKey(id).sole(columns);
  }

  /* Get the first record matching the attributes or instantiate it. */
  public async firstOrNew(attributes: any, values: any = {}): Promise<T> {
    const instance = (await this.where(attributes).first()) as T;
    if (!isBlank(instance)) {
      return instance;
    }
    return this.newModelInstance({ ...attributes, ...values });
  }

  /* Get the first record matching the attributes or create it. */
  public async firstOrCreate(attributes: any, values: any = {}): Promise<T> {
    let instance = (await this.where(attributes).first()) as T;
    if (!isBlank(instance)) {
      return instance;
    }
    instance = this.newModelInstance({ ...attributes, ...values });
    await instance.Save();
    return instance;
  }

  /* Attempt to create a record matching the attributes; on unique-constraint failure read the existing one. */
  public async createOrFirst(attributes: any, values: any = {}): Promise<T> {
    try {
      return await this.withSavepointIfNeeded(() => this.create({ ...attributes, ...values }));
    } catch (e) {
      const instance = (await this.where(attributes).first()) as T;
      if (!isBlank(instance)) {
        return instance;
      }
      throw e;
    }
  }

  /* Increment the value of an existing record, or create a new one when missing. */
  public async incrementOrCreate(
    attributes: any,
    column = 'count',
    defaultValue = 1,
    step = 1,
    extra: any = {},
  ): Promise<T> {
    const instance = await this.firstOrCreate(attributes, { ...extra, [column]: defaultValue });
    if (!(instance as any)._wasRecentlyCreated) {
      (instance as any)[column] = ((instance as any)[column] ?? 0) + step;
      for (const [k, v] of Object.entries(extra)) {
        (instance as any)[k] = v;
      }
      await instance.Save();
    }
    return instance;
  }

  /* Run the given callback inside a savepoint if a transaction is active. */
  protected async withSavepointIfNeeded<R>(scope: () => Promise<R>): Promise<R> {
    return scope();
  }

  /* Create or update a record matching the attributes, and fill it with values. */
  public async updateOrCreate(attributes: any, values: Record<string, any>): Promise<T> {
    const instance = await this.firstOrNew(attributes);
    await instance.Fill(values).Save();
    return instance;
  }

  /* Execute the query and get the first result or throw an exception. */
  public async firstOrFail(columns: any[] = ['*']): Promise<T> {
    const model = await this.first(columns);
    if (!isBlank(model)) {
      // @ts-ignore
      return model;
    }
    throw new Error(`ModelNotFoundException No query results for model [${this._model.constructor.name}];`);
  }

  /* Execute the query and get the first result or call a callback. */
  public async firstOr(
    columns: FedacoBuilderCallBack | any[] = ['*'],
    callback: FedacoBuilderCallBack | null = null,
  ): Promise<T> {
    if (isFunction(columns)) {
      callback = columns;
      columns = ['*'];
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

  /* Execute the query and get the first result if it's the sole matching record. */
  public async sole(columns: any[] | string = ['*']): Promise<T> {
    const result = await this.take(2).get(columns);
    if (result.length === 0) {
      throw new Error(`ModelNotFoundException No query results for model [${this._model.constructor.name}].`);
    }
    if (result.length > 1) {
      throw new Error(`MultipleRecordsFoundException ${result.length} records were found.`);
    }
    return result[0];
  }

  /* Get a single column's value from the first result, expecting exactly one match. */
  public async soleValue<K extends keyof T>(column: K): Promise<T[K]> {
    const model = await this.sole([column as string]);
    return (model as any)[column];
  }

  /* Get a single column's value from the first result of a query, or throw. */
  public async valueOrFail<K extends keyof T>(column: K): Promise<T[K]> {
    const result = (await this.firstOrFail([column as string])) as T;
    return result[column];
  }

  /* Get a single column's value from the first result of a query. */
  public async value<K extends keyof T>(column: K): Promise<T[K] | void> {
    const result: T = (await this.first([column])) as T;
    if (result) {
      return result[column];
    }
  }

  /**
   * Execute the query as a "select" statement.
   */
  public async get(columns: string[] | string = ['*']): Promise<T[]> {
    const builder = this.applyScopes();
    let models = await builder.getModels(columns);
    if (models.length > 0) {
      models = await builder.eagerLoadRelations(models);
    }
    // @ts-ignore
    return builder.applyAfterQueryCallbacks(models);
  }

  /* Register a callback to be invoked after the query is run. */
  public afterQuery(callback: (result: any) => any): this {
    this._afterQueryCallbacks.push(callback);
    return this;
  }

  /* Invoke registered after-query callbacks against the given result. */
  public applyAfterQueryCallbacks(result: any): any {
    for (const callback of this._afterQueryCallbacks) {
      const next = callback(result);
      if (next !== undefined) {
        result = next;
      }
    }
    return result;
  }

  /* Get the hydrated models without eager loading. */
  public async getModels(columns: any[] | string = ['*']): Promise<T[]> {
    // @ts-ignore
    return this._model.NewQuery().hydrate(await this._query.get(columns));
  }

  /* Eager load the relationships for the models. */
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

  /* Eagerly load the relationship on a set of models. */
  async _eagerLoadRelation(models: any[], name: string, constraints: FedacoBuilderCallBack): Promise<T[]> {
    const relation = this.getRelation(name);
    relation.addEagerConstraints(models);
    constraints(relation);
    // @ts-ignore
    return relation.match(relation.initRelation(models, name), await relation.getEager(), name);
  }

  /* Get the relation instance for the given relation name. */
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

  /* Get the deeply nested relations for a given top-level relation. */
  _relationsNestedUnder(relation: string): Record<string, any> {
    const nested: any = {};
    for (const [name, constraints] of Object.entries(this._eagerLoad)) {
      if (this._isNestedUnder(relation, name)) {
        nested[name.substr((relation + '.').length)] = constraints;
      }
    }
    return nested;
  }

  /* Determine if the relationship is nested. */
  _isNestedUnder(relation: string, name: string): boolean {
    return name.includes('.') && name.startsWith(relation + '.');
  }

  // /*Get a lazy collection for the given query.*/
  // public cursor() {
  //   return this.applyScopes().query.cursor().map(record => {
  //     return this.newModelInstance().newFromBuilder(record);
  //   });
  // }

  /**
   * Stream the query results one model at a time as an RxJS Observable.
   *
   * Internally pulls rows in chunks (default 1000) using `chunk()` and emits
   * each hydrated model. Unsubscribing aborts further fetching.
   */
  public cursor(columns: any[] | string = ['*'], chunkSize = 1000): Observable<T> {
    return new Observable<T>((subscriber) => {
      // chunk() on FedacoBuilder hydrates each page to model instances via get().
      // We don't propagate `columns` to chunk() because chunk's signature is
      // (count, concurrent). If callers need column projection on a streamed
      // cursor, they should call .select(cols) before cursor().
      const colsArray = Array.isArray(columns) ? columns : [columns];
      const wantsAll = colsArray.length === 1 && colsArray[0] === '*';
      if (!wantsAll) {
        this.select(colsArray);
      }
      const sub = this.chunk(chunkSize).subscribe({
        next: ({ results }: { results: T[]; page: number }) => {
          for (const model of results) {
            if (subscriber.closed) {
              return;
            }
            subscriber.next(model);
          }
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      return () => sub.unsubscribe();
    });
  }

  /* Add a generic "order by" clause if the query doesn't already have one. */
  _enforceOrderBy() {
    if (!this._query._orders.length && !this._query._unionOrders.length) {
      this.orderBy(this._model.GetQualifiedKeyName(), 'asc');
    }
  }

  /* Get an array with the values of a given column. */
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
      return results.map((value) => {
        return (
          this._model.NewFromBuilder({
            [column]: value,
          }) as KeyAbleModel
        )[column];
      });
    } else {
      throw new Error('not implement');
    }
  }

  /* Paginate the given query. */
  public async paginate(
    page = 1,
    pageSize?: number,
    columns: any[] = ['*'],
  ): Promise<{ items: any[]; total: number; pageSize: number; page: number }> {
    pageSize = pageSize || this._model.GetPerPage();
    const total = await this.toBase().getCountForPagination();
    const results = total > 0 ? await this.forPage(page, pageSize).get(columns) : [];
    return {
      items: results,
      total,
      pageSize,
      page,
    };
  }

  /* Paginate the given query into a simple paginator. */
  public async simplePaginate(
    page = 1,
    pageSize?: number,
    columns: any[] = ['*'],
  ): Promise<{ items: any[]; pageSize: number; page: number }> {
    pageSize = pageSize || this._model.GetPerPage();
    this.skip((page - 1) * pageSize).take(pageSize + 1);
    const results = await this.get(columns);
    return {
      items: results,
      pageSize,
      page,
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

  /**
   * Paginate the query using keyset (cursor) pagination over the existing order.
   *
   * The `cursor` argument is either a `Cursor` instance, an encoded base64url
   * string (as returned by `CursorPaginator.nextPageCursor()` /
   * `previousPageCursor()`), or null for the first page. The returned
   * `CursorPaginator` exposes `nextPageCursor()` / `previousPageCursor()`
   * which yield the encoded string to round-trip through `?cursor=…`.
   *
   * If no orderBy is set, the model's primary key is used. The keyset
   * predicate is applied to each `UNION` arm so multi-source result sets
   * stay coherent.
   */
  public async cursorPaginate(
    pageSize?: number,
    columns: any[] = ['*'],
    cursorName = 'cursor',
    cursor: Cursor | string | null = null,
  ): Promise<CursorPaginator<T>> {
    pageSize = pageSize || this._model.GetPerPage();
    const resolvedCursor = Cursor.fromEncoded(cursor);
    const shouldReverse = resolvedCursor?.pointsToPreviousItems() ?? false;

    const orderColumns = this._ensureOrderForCursorPagination(shouldReverse);

    if (resolvedCursor !== null && orderColumns.length > 0) {
      this._addCursorConditions(this, resolvedCursor, orderColumns);
      // Each union arm is an independent SELECT that needs its own keyset
      // filter; without it those rows would bypass cursor scoping.
      for (const fragment of this._query._unions ?? []) {
        const sub = (fragment as any)?.expression;
        if (sub && typeof sub.where === 'function') {
          this._addCursorConditions(sub, resolvedCursor, orderColumns);
        }
      }
    }

    this.take(pageSize + 1);
    const items = await this.get(columns);
    const hasMore = items.length > pageSize;
    if (hasMore) {
      items.pop();
    }
    // When paginating backwards we fetched in reverse direction; flip back so
    // callers always see items in the originally-requested order.
    if (shouldReverse) {
      items.reverse();
    }

    return new CursorPaginator<T>(items, pageSize, resolvedCursor, cursorName, orderColumns, hasMore);
  }

  /**
   * Apply the keyset predicate for `cursor` to `target` (either this builder
   * or a union sub-builder). Builds an OR-chain of AND-chains:
   *   col1 > c1
   *   OR (col1 = c1 AND col2 > c2)
   *   OR (col1 = c1 AND col2 = c2 AND col3 > c3)
   * with the comparison direction inverted for `desc` orders.
   */
  protected _addCursorConditions(
    target: { where: (cb: (q: any) => void) => any },
    cursor: Cursor,
    orderColumns: CursorOrderColumn[],
  ): void {
    target.where((query: any) => {
      for (let i = 0; i < orderColumns.length; i++) {
        const { column, whereColumn, direction } = orderColumns[i];
        const cursorValue = cursor.parameter(column);
        if (cursorValue === null) {
          continue;
        }
        const op = direction === 'asc' ? '>' : '<';
        query.orWhere((sub: any) => {
          for (let j = 0; j < i; j++) {
            sub.where(orderColumns[j].whereColumn, '=', cursor.parameter(orderColumns[j].column));
          }
          sub.where(whereColumn, op, cursorValue);
        });
      }
    });
  }

  /**
   * Ensure the underlying query has an `orderBy` and return the (possibly
   * reversed) order columns as `{column, whereColumn, direction}` tuples.
   * Falls back to the model's primary key when no order has been set.
   *
   * When the query has UNIONs, ordering lives on `_unionOrders` (applied
   * outside the UNION); otherwise it lives on `_orders`. We mutate whichever
   * is in use so the underlying SELECT actually executes in the desired
   * direction.
   */
  protected _ensureOrderForCursorPagination(shouldReverse = false): CursorOrderColumn[] {
    if (this._query._orders.length === 0 && this._query._unionOrders.length === 0) {
      this._enforceOrderBy();
    }
    const orderField: '_orders' | '_unionOrders' = this._query._unionOrders.length > 0 ? '_unionOrders' : '_orders';
    if (shouldReverse) {
      this._query[orderField] = this._query[orderField].map((order: any) => {
        // Order AST nodes may either carry a public `direction` or `_direction`
        // depending on construction site; flip whichever exists.
        if (order && typeof order === 'object') {
          if ('direction' in order) {
            order.direction = order.direction === 'asc' ? 'desc' : 'asc';
          } else if ('_direction' in order) {
            order._direction = order._direction === 'asc' ? 'desc' : 'asc';
          }
        }
        return order;
      });
    }
    return this._query[orderField]
      .map((order: any) => {
        const column = this._extractOrderColumnName(order?.column ?? order?._column);
        if (column === null) {
          return null;
        }
        const direction = (order?.direction ?? order?._direction ?? 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
        return {
          column,
          whereColumn: this._resolveColumnForCursor(column),
          direction,
        } as CursorOrderColumn;
      })
      .filter((x): x is CursorOrderColumn => x !== null);
  }

  /**
   * Resolve a cursor column name back to the original column expression when
   * SELECT has aliased it. Returns `name` unchanged if no matching alias is
   * found, or if the SELECT side uses something we can't statically extract
   * (raw expressions, subqueries, etc).
   *
   * Example: `select('users.created_at as date').orderBy('date')` should
   * compare against `users.created_at` in the WHERE clause, not against
   * `date` (which isn't a real column).
   *
   * Supports both shapes used by the query parser:
   *   - `ColumnReferenceExpression { expression, fieldAliasIdentificationVariable }`
   *     (produced by `select('col as alias')`)
   *   - `AsExpression { name, as }` (used internally by some constructions)
   */
  protected _resolveColumnForCursor(name: string): string {
    const cols: any[] = this._query._columns ?? [];
    for (const col of cols) {
      if (!col || typeof col !== 'object') {
        continue;
      }
      // ColumnReferenceExpression
      const refAlias = col.fieldAliasIdentificationVariable;
      const refAliasName = typeof refAlias?.name === 'string' ? refAlias.name : null;
      if (refAliasName === name && col.expression) {
        const original = this._extractOrderColumnName(col.expression);
        if (original !== null) {
          return original;
        }
      }
      // AsExpression
      const asAlias = col.as;
      const asAliasName = typeof asAlias?.name === 'string' ? asAlias.name : null;
      if (asAliasName === name && col.name) {
        const original = this._extractOrderColumnName(col.name);
        if (original !== null) {
          return original;
        }
      }
    }
    return name;
  }

  /**
   * Extract the unqualified column name from an orderBy AST node. Only handles
   * the common `PathExpression([Identifier(table?), Identifier(column)])` shape
   * produced by `orderBy('col')` / `orderBy('table.col')`; returns null for
   * raw expressions, subqueries, etc. (which can't drive cursor pagination).
   */
  protected _extractOrderColumnName(node: any): string | null {
    if (!node) {
      return null;
    }
    const idents: any[] | undefined = node.identifiers;
    if (!Array.isArray(idents) || idents.length === 0) {
      return null;
    }
    const last = idents[idents.length - 1];
    const name = last?.name;
    if (typeof name === 'string') {
      return name;
    }
    if (typeof name === 'function') {
      try {
        return String(name());
      } catch {
        return null;
      }
    }
    return null;
  }
  /* Save a new model and return the instance. */
  public async create(attributes?: Record<string, any>): Promise<T> {
    const instance = this.newModelInstance(attributes);
    await instance.Save();
    return instance;
  }

  /* Save a new model and return the instance without firing events. */
  public async createQuietly(attributes: Record<string, any> = {}): Promise<T> {
    return (this._model.constructor as typeof Model).withoutEvents(() => this.create(attributes));
  }

  /* Save a new model and return the instance. Allow mass-assignment. */
  public async forceCreate(attributes: Record<string, any>) {
    return (this._model.constructor as typeof Model).unguarded(() => {
      return this.newModelInstance().NewQuery().create(attributes);
    });
  }

  /* Save a new model and return the instance without firing events. Allow mass-assignment. */
  public async forceCreateQuietly(attributes: Record<string, any> = {}): Promise<T> {
    return (this._model.constructor as typeof Model).withoutEvents(() => this.forceCreate(attributes));
  }

  /* Update records in the database. */
  public async update(values: any): Promise<any> {
    return this.toBase().update(this._addUpdatedAtColumn(values));
  }

  /* Insert new records or update the existing ones. */
  public upsert(values: any[] | any, uniqueBy?: any[] | string, update?: any[] | any): Promise<number> | number {
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
    return this.toBase().upsert(
      this._addTimestampsToUpsertValues(values),
      uniqueBy,
      this._addUpdatedAtToUpsertColumns(update),
    );
  }

  /* Increment a column's value by a given amount. */
  public increment(column: string, amount = 1, extra: any = {}): Promise<any> {
    return this.toBase().increment(column, amount, this._addUpdatedAtColumn(extra));
  }

  /* Decrement a column's value by a given amount. */
  public decrement(column: string, amount = 1, extra: any = {}): Promise<any> {
    return this.toBase().decrement(column, amount, this._addUpdatedAtColumn(extra));
  }

  /* Increment each of the given columns by a given amount. */
  public async incrementEach(columns: Record<string, number>, extra: any = {}): Promise<any> {
    const updates: Record<string, any> = {};
    const grammar: any = (this._query as any)._grammar;
    for (const [column, amount] of Object.entries(columns)) {
      if (typeof amount !== 'number') {
        throw new Error(
          `InvalidArgumentException Non-numeric value passed as increment amount for column: '${column}'.`,
        );
      }
      const wrapped = grammar.wrap(column);
      updates[column] = raw(`${wrapped} + ${amount}`);
    }
    return this.toBase().update({ ...this._addUpdatedAtColumn(extra), ...updates });
  }

  /* Decrement each of the given columns by a given amount. */
  public async decrementEach(columns: Record<string, number>, extra: any = {}): Promise<any> {
    const updates: Record<string, any> = {};
    const grammar: any = (this._query as any)._grammar;
    for (const [column, amount] of Object.entries(columns)) {
      if (typeof amount !== 'number') {
        throw new Error(
          `InvalidArgumentException Non-numeric value passed as decrement amount for column: '${column}'.`,
        );
      }
      const wrapped = grammar.wrap(column);
      updates[column] = raw(`${wrapped} - ${amount}`);
    }
    return this.toBase().update({ ...this._addUpdatedAtColumn(extra), ...updates });
  }

  /* Update the column's updated_at timestamp. */
  public async touch(column?: string): Promise<any> {
    const time = this._model.FreshTimestampString();
    if (column) {
      return this.toBase().update({ [column]: time });
    }
    if (!this._model.UsesTimestamps() || isBlank(this._model.GetUpdatedAtColumn())) {
      return false;
    }
    return this.toBase().update({ [this._model.GetUpdatedAtColumn()]: time });
  }

  /* Add the "updated at" column to an array of values. */
  _addUpdatedAtColumn(values: any): Record<string, any> {
    if (!this._model.UsesTimestamps() || isBlank(this._model.GetUpdatedAtColumn())) {
      return values;
    }
    const column = this._model.GetUpdatedAtColumn();
    values = {
      ...values,
      [column]: column in values ? values[column] : this._model.FreshTimestampString(),
    };
    // let segments            = preg_split('/\\s+as\\s+/i', this._query.from);
    // let qualifiedColumn     = end(segments) + '.' + column;
    // values[qualifiedColumn] = values[column];
    // delete values[column];
    return values;
  }

  /* Add timestamps to the inserted values. */
  _addTimestampsToUpsertValues(values: any[]) {
    if (!this._model.UsesTimestamps()) {
      return values;
    }
    const timestamp = this._model.FreshTimestampString();
    const columns = [this._model.GetCreatedAtColumn(), this._model.GetUpdatedAtColumn()];
    for (const row of values) {
      for (const column of columns) {
        row[column] = timestamp;
      }
    }
    return values;
  }

  /* Add the "updated at" column to the updated columns. */
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

  /* Delete records from the database. */
  public async delete(): Promise<any> {
    if (this._onDelete !== undefined) {
      return this._onDelete.call(this, this);
    }
    return this.toBase().delete();
  }

  /* Run the default delete function on the builder.

  Since we do not apply scopes here, the row will actually be deleted. */
  public forceDelete(): Promise<boolean> {
    return this._query.delete();
  }

  /* Register a replacement for the default delete function. */
  public onDelete(callback: (builder: FedacoBuilder) => any): void {
    this._onDelete = callback;
  }

  /* Determine if the given model has a scope. */
  public hasNamedScope(scope: string): boolean {
    return this._model && this._model.HasNamedScope(scope);
  }

  /* Call the given local model scopes. */
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

  /* Apply the scopes to the Eloquent builder instance and return it. */
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
        if (scope instanceof BaseScope) {
          scope.apply(_builder, this.getModel());
        }
      });
    }
    return builder;
  }

  /* Apply the given scope on the current builder instance. */
  callScope(scope: (...args: any[]) => any | void, parameters: any[] = []): any | void {
    parameters.unshift(this);
    const query = this.getQuery();
    const originalWhereCount = !query._wheres.length ? 0 : query._wheres.length;
    const result = scope(...parameters) ?? this;
    if (/* cast type array */ query._wheres.length > originalWhereCount) {
      this._addNewWheresWithinGroup(query, originalWhereCount);
    }
    return result;
  }

  /* Apply the given named scope on the current builder instance. */
  callNamedScope(scope: string, parameters: any[] = []): any | void {
    return this.callScope((params: any[]) => {
      return this._model.CallNamedScope(scope, params);
    }, parameters);
  }

  /* Nest where conditions by slicing them at the given where count. */
  _addNewWheresWithinGroup(query: QueryBuilder, originalWhereCount: number): void {
    const allWheres = query._wheres;
    query._wheres = [];
    this._groupWhereSliceForScope(query, allWheres.slice(0, originalWhereCount));
    this._groupWhereSliceForScope(query, allWheres.slice(originalWhereCount));
  }

  /* Slice where conditions at the given offset and add them to the query as a nested condition. */
  _groupWhereSliceForScope(query: QueryBuilder, whereSlice: any[]): void {
    const whereBooleans = pluck(whereSlice, 'boolean');
    if (whereBooleans.includes('or')) {
      query._wheres.push(this._createNestedWhere(whereSlice, whereBooleans.at(0)));
    } else {
      query._wheres = [...query._wheres, ...whereSlice];
    }
  }

  /* Create a where array with nested where conditions. */
  _createNestedWhere(whereSlice: any[], conjunction = 'and') {
    const whereGroup = this.getQuery().forNestedWhere();
    whereGroup._wheres = whereSlice;
    return {
      type: 'Nested',
      query: whereGroup,
      boolean: conjunction,
    };
  }

  public pipe(...args: any[]): this {
    args.forEach((scopeFn) => {
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
  public with(
    relations: { [key: string]: RelationCallBack } | string[] | string,
    callback?: RelationCallBack | { [key: string]: RelationCallBack } | string,
  ): this {
    if (!relations || (isArray(relations) && !relations.length)) {
      return this;
    }
    let eagerLoad;
    if (isFunction(callback)) {
      eagerLoad = this._parseWithRelations([{ [relations as string]: callback }]);
    } else {
      eagerLoad = this._parseWithRelations(isArray(relations) ? (relations as any[]) : [...arguments]);
    }
    this._eagerLoad = { ...this._eagerLoad, ...eagerLoad };
    return this;
  }

  /* Prevent the specified relations from being eager loaded. */
  public without(relations: any): this {
    this._eagerLoad = omit(this._eagerLoad, isString(relations) ? arguments : relations);
    return this;
  }

  /* Remove the given relations from the eager-load set (alias of without). */
  public withoutEagerLoad(relations: any): this {
    return this.without(relations);
  }

  /* Clear all eager-loaded relations. */
  public withoutEagerLoads(): this {
    this._eagerLoad = {};
    return this;
  }

  /* Set the relationships that should be eager loaded while removing any previously added eager loading specifications. */
  public withOnly(relations: any): this {
    this._eagerLoad = {};
    return this.with(relations);
  }

  /* Create a new instance of the model being queried. */
  public newModelInstance(attributes?: Record<string, any>): T {
    return this._model
      .NewInstance({ ...this._pendingAttributes, ...attributes })
      .SetConnection(this._query.getConnection().getName());
  }

  /* Add default attributes for new model instances and (optionally) as where conditions. */
  public withAttributes(attributes: Record<string, any> | string, value: any = null, asConditions = true): this {
    const attrs: Record<string, any> = isString(attributes) ? { [attributes]: value } : attributes;
    if (asConditions) {
      for (const [column, val] of Object.entries(attrs)) {
        this.where(this.qualifyColumn(column), '=', val);
      }
    }
    this._pendingAttributes = { ...this._pendingAttributes, ...attrs };
    return this;
  }

  /* Parse a list of relations into individuals. */
  _parseWithRelations(relations: any[]): { [key: string]: FedacoBuilderCallBack } {
    let results: Record<string, FedacoBuilderCallBack> = {};
    for (const relation of relations) {
      if (isString(relation)) {
        const [name, constraints] = relation.includes(':')
          ? (this._createSelectWithConstraint(relation) as [string, (...args: any[]) => void])
          : [relation, () => {}];

        results = this._addNestedWiths(name, results);
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

  /* Create a constraint to select the given columns for the relation. */
  _createSelectWithConstraint(name: string): [string, FedacoBuilderCallBack] {
    return [
      name.split(':')[0],
      (query: any) => {
        query.select(
          name
            .split(':')[1]
            .split(',')
            .map((column) => {
              if (column.includes('.')) {
                return column;
              }
              // @ts-ignore
              return query[BelongsToManySymbol] ? query.getRelated().getTable() + '.' + column : column;
            }),
        );
      },
    ];
  }

  /* Parse the nested relationships in a relation. */
  _addNestedWiths(name: string, results: Record<string, FedacoBuilderCallBack>): Record<string, FedacoBuilderCallBack> {
    const progress = [];
    for (const segment of name.split('.')) {
      progress.push(segment);
      const last = progress.join('.');
      if (!(results[last] !== undefined)) {
        results[last] = () => {};
      }
    }
    return results;
  }

  /* Apply query-time casts to the model instance. */
  public withCasts(casts: any): this {
    this._model.MergeCasts(casts);
    return this;
  }

  /* Get the underlying query builder instance. */
  public getQuery(): QueryBuilder {
    return this._query;
  }

  /* Set the underlying query builder instance. */
  public setQuery(query: QueryBuilder): this {
    this._query = query;
    return this;
  }

  /* Set the connection for this query builder instance. */
  public withConnection(connection: Connection): this {
    this._query.withConnection(connection);
    return this;
  }

  /* Get a base query builder instance. */
  public toBase(): QueryBuilder {
    return this.applyScopes().getQuery();
  }

  /* Get the relationships being eagerly loaded. */
  public getEagerLoads(): { [key: string]: FedacoBuilderCallBack } {
    return this._eagerLoad;
  }

  /* Set the relationships being eagerly loaded. */
  public setEagerLoads(eagerLoad: any): this {
    this._eagerLoad = eagerLoad;
    return this;
  }

  /* Get the default key name of the table. */
  _defaultKeyName(): string {
    return this.getModel().GetKeyName();
  }

  /* Get the model instance being queried. */
  public getModel(): T {
    return this._model;
  }

  /* Set a model instance for the model being queried. */
  public setModel(model: T): this {
    this._model = model;
    this._query.from(model.GetTable());
    return this;
  }

  /* Qualify the given column name by the model's table. */
  public qualifyColumn(column: string): string {
    return this._model.QualifyColumn(column);
  }

  /* Qualify the given columns with the model's table. */
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
    const builder = new FedacoBuilder<T>(this._query.clone());
    builder._scopes = { ...this._scopes };
    builder._model = this._model;
    builder._eagerLoad = { ...this._eagerLoad };
    builder._onCloneCallbacks = [...this._onCloneCallbacks];
    builder._pendingAttributes = { ...this._pendingAttributes };
    builder._afterQueryCallbacks = [...this._afterQueryCallbacks];
    for (const callback of this._onCloneCallbacks) {
      callback(builder);
    }
    return builder;
  }

  /* Register a closure to be invoked on the clone. */
  public onClone(callback: (builder: FedacoBuilder<T>) => void): this {
    this._onCloneCallbacks.push(callback);
    return this;
  }

  [FedacoBuilderSymbol] = true;
}
