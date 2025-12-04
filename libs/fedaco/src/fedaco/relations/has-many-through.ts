/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray, isBlank } from '@gradii/nanofn';
import { uniq } from 'ramda';
import type { Collection } from '../../define/collection';
import type { Constructor } from '../../helper/constructor';
import type { FedacoBuilder } from '../fedaco-builder';
import type { Model } from '../model';
import type { InteractsWithDictionary } from './concerns/interacts-with-dictionary';
import { mixinInteractsWithDictionary } from './concerns/interacts-with-dictionary';
import { Relation } from './relation';

export interface HasManyThrough extends InteractsWithDictionary, Constructor<Relation> {
  /* The "through" parent model instance. */
  _throughParent: Model;
  /* The far parent model instance. */
  _farParent: Model;
  /* The near key on the relationship. */
  _firstKey: string;
  /* The far key on the relationship. */
  _secondKey: string;
  /* The local key on the relationship. */
  _localKey: string;
  /* The local key on the intermediary model. */
  _secondLocalKey: string;

  /* Set the base constraints on the relation query. */
  addConstraints(): void;

  /* Set the join clause on the query. */
  _performJoin(query?: FedacoBuilder | null): void;

  /* Get the fully qualified parent key name. */
  getQualifiedParentKeyName(): string;

  /* Determine whether "through" parent of the relation uses Soft Deletes. */
  throughParentSoftDeletes(): boolean;

  /* Indicate that trashed "through" parents should be included in the query. */
  withTrashedParents(): this;

  /* Set the constraints for an eager load of the relation. */
  addEagerConstraints(models: Model[]): void;

  /* Initialize the relation on a set of models. */
  initRelation(models: Model[], relation: string): Model[];

  /* Match the eagerly loaded results to their parents. */
  match(this: Model & this, models: Model[], results: Collection, relation: string): Model[];

  /* Build model dictionary keyed by the relation's foreign key. */
  _buildDictionary(results: Collection): {
    [key: string]: any[];
  };

  /* Get the first related model record matching the attributes or instantiate it. */
  firstOrNew(attributes: any[]): Promise<Model>;

  /* Create or update a related record matching the attributes, and fill it with values. */
  updateOrCreate(attributes: any[], values?: any[]): Promise<Model>;

  /* Add a basic where clause to the query, and return the first result. */
  firstWhere(
    column: Function | string | any[],
    operator?: any,
    value?: any,
    conjunction?: 'and' | 'or' | string,
  ): Promise<Model>;

  /* Execute the query and get the first related model. */
  first(columns?: any[]): Promise<Model>;

  /* Execute the query and get the first result or throw an exception. */
  firstOrFail(columns?: any[]): Promise<Model>;

  /* Find a related model by its primary key. */
  find(id: any, columns?: any[]): Promise<Model | Model[]>;

  /* Find multiple related models by their primary keys. */
  findMany(ids: any[], columns?: any[]): Promise<Model[]>;

  /* Find a related model by its primary key or throw an exception. */
  findOrFail(id: any | any[], columns?: any[]): Promise<Model | Model[]>;

  /* Get the results of the relationship. */
  getResults(): Promise<Model | Model[]>;

  /* Execute the query as a "select" statement. */
  get(columns?: any[]): Promise<Model | Model[]>;

  /* Set the select clause for the relation query. */
  _shouldSelect(columns?: any[]): string[];

  /* Prepare the query builder for query execution. */
  _prepareQueryBuilder(columns?: any[]): FedacoBuilder;

  /* Add the constraints for a relationship query. */
  getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): FedacoBuilder;

  /* Add the constraints for a relationship query on the same table. */
  getRelationExistenceQueryForSelfRelation(
    query: FedacoBuilder,
    parentQuery: FedacoBuilder,
    columns?: any[] | any,
  ): FedacoBuilder;

  /* Add the constraints for a relationship query on the same table as the through parent. */
  getRelationExistenceQueryForThroughSelfRelation(
    query: FedacoBuilder,
    parentQuery: FedacoBuilder,
    columns?: any[] | any,
  ): FedacoBuilder;

  /* Get the qualified foreign key on the related model. */
  getQualifiedFarKeyName(): string;

  /* Get the foreign key on the "through" model. */
  getFirstKeyName(): string;

  /* Get the qualified foreign key on the "through" model. */
  getQualifiedFirstKeyName(): string;

  /* Get the foreign key on the related model. */
  getForeignKeyName(): string;

  /* Get the qualified foreign key on the related model. */
  getQualifiedForeignKeyName(): string;

  /* Get the local key on the far parent model. */
  getLocalKeyName(): string;

  /* Get the qualified local key on the far parent model. */
  getQualifiedLocalKeyName(): string;

  /* Get the local key on the intermediary model. */
  getSecondLocalKeyName(): string;
}

export class HasManyThrough extends mixinInteractsWithDictionary(Relation) {
  /* The "through" parent model instance. */
  _throughParent: Model;
  /* The far parent model instance. */
  _farParent: Model;
  /* The near key on the relationship. */
  _firstKey: string;
  /* The far key on the relationship. */
  _secondKey: string;
  /* The local key on the relationship. */
  _localKey: string;
  /* The local key on the intermediary model. */
  _secondLocalKey: string;

  /* Create a new has many through relationship instance. */
  public constructor(
    query: FedacoBuilder,
    farParent: Model,
    throughParent: Model,
    firstKey: string,
    secondKey: string,
    localKey: string,
    secondLocalKey: string,
  ) {
    super(query, throughParent);
    this._localKey = localKey;
    this._firstKey = firstKey;
    this._secondKey = secondKey;
    this._farParent = farParent;
    this._throughParent = throughParent;
    this._secondLocalKey = secondLocalKey;
    this.addConstraints();
  }

  /* Set the base constraints on the relation query. */
  public addConstraints(): void {
    // @ts-ignore
    const localValue = this._farParent.GetAttribute(this._localKey);
    this._performJoin();
    if (HasManyThrough.constraints) {
      this._query.where(this.getQualifiedFirstKeyName(), '=', localValue);
    }
  }

  /* Set the join clause on the query. */
  _performJoin(query: FedacoBuilder | null = null): void {
    query = query || this._query;
    const farKey = this.getQualifiedFarKeyName();
    query.join(this._throughParent.GetTable(), this.getQualifiedParentKeyName(), '=', farKey);
    if (this.throughParentSoftDeletes()) {
      query.withGlobalScope('SoftDeletableHasManyThrough', (q: FedacoBuilder | null) => {
        // @ts-ignore
        q.whereNull(this._throughParent.getQualifiedDeletedAtColumn());
      });
    }
  }

  /* Get the fully qualified parent key name. */
  public getQualifiedParentKeyName() {
    return this._parent.QualifyColumn(this._secondLocalKey);
  }

  /* Determine whether "through" parent of the relation uses Soft Deletes. */
  public throughParentSoftDeletes(): boolean {
    // @ts-ignore
    return this._throughParent.__isTypeofSoftDeletes;
    // return in_array(SoftDeletes, class_uses_recursive(this.throughParent));
  }

  /* Indicate that trashed "through" parents should be included in the query. */
  public withTrashedParents(): this {
    this._query.withoutGlobalScope('SoftDeletableHasManyThrough');
    return this;
  }

  /* Set the constraints for an eager load of the relation. */
  public addEagerConstraints(models: Model[]): void {
    const whereIn = this._whereInMethod(this._farParent, this._localKey);
    this._query[whereIn](this.getQualifiedFirstKeyName(), this.getKeys(models, this._localKey));
  }

  /* Initialize the relation on a set of models. */
  public initRelation(models: Model[], relation: string): Model[] {
    for (const model of models) {
      model.SetRelation(relation, this._related.NewCollection());
    }
    return models;
  }

  /* Match the eagerly loaded results to their parents. */
  public match(this: Model & this, models: Model[], results: Collection, relation: string): Model[] {
    const dictionary = this._buildDictionary(results);
    for (const model of models) {
      const key = this._getDictionaryKey(model.GetAttribute(this._localKey));
      if (dictionary[key] !== undefined) {
        model.SetRelation(relation, this._related.NewCollection(dictionary[key]));
      }
    }
    return models;
  }

  /* Build model dictionary keyed by the relation's foreign key. */
  _buildDictionary(results: Collection): { [key: string]: any[] } {
    const dictionary: any = {};
    for (const result of results) {
      if (!dictionary[result.GetAttribute('fedaco_through_key')]) {
        dictionary[result.GetAttribute('fedaco_through_key')] = [];
      }
      dictionary[result.GetAttribute('fedaco_through_key')].push(result);
    }
    return dictionary;
  }

  /* Get the first related model record matching the attributes or instantiate it. */
  public async firstOrNew(attributes: any[]): Promise<Model> {
    let instance = (await this.where(attributes).first()) as Model;
    if (isBlank(instance)) {
      instance = this._related.NewInstance(attributes);
    }
    return instance;
  }

  /* Create or update a related record matching the attributes, and fill it with values. */
  public async updateOrCreate(attributes: any[], values: any[] = []): Promise<Model> {
    const instance = (await this.firstOrNew(attributes)) as Model;
    await instance.Fill(values).Save();
    return instance;
  }

  /* Add a basic where clause to the query, and return the first result. */
  public async firstWhere(
    column: any | string | any[],
    operator: any = null,
    value: any = null,
    conjunction = 'and',
  ): Promise<Model> {
    return this.where(column, operator, value, conjunction).first();
  }

  /* Execute the query and get the first related model. */
  public async first(columns: any[] = ['*']): Promise<Model> {
    const results = await this.take(1).get(columns);
    return results.length > 0 ? (results as Model[])[0] : null;
  }

  /* Execute the query and get the first result or throw an exception. */
  public async firstOrFail(columns: any[] = ['*']): Promise<Model> {
    const model = await this.first(columns);
    if (!isBlank(model)) {
      return model;
    }
    throw new Error(`ModelNotFoundException No query results for model [${this._related.constructor.name}].`);
  }

  /* Find a related model by its primary key. */
  public async find(id: any, columns: any[] = ['*']): Promise<Model | Model[]> {
    if (isArray(id)) {
      return this.findMany(id, columns);
    }
    return (await this.where(this.getRelated().GetQualifiedKeyName(), '=', id).first(columns)) as Model;
  }

  /* Find multiple related models by their primary keys. */
  public async findMany(ids: any[], columns: any[] = ['*']): Promise<Model[]> {
    // let ids = ids instanceof Arrayable ? ids.toArray() : ids;
    if (!ids.length) {
      return this.getRelated().NewCollection();
    }
    return (await this.whereIn(this.getRelated().GetQualifiedKeyName(), ids).get(columns)) as Model[];
  }

  /* Find a related model by its primary key or throw an exception. */
  public async findOrFail(id: any | any[], columns: any[] = ['*']): Promise<Model | Model[]> {
    const result = await this.find(id, columns);
    // let id     = id instanceof Arrayable ? id.toArray() : id;
    if (isArray(id)) {
      if (result.length === uniq(id).length) {
        return result;
      }
    } else if (!isBlank(result)) {
      return result;
    }
    throw new Error(`ModelNotFoundException No query results for model [${this._related.constructor.name}] [${id}]`);
  }

  /* Get the results of the relationship. */
  public async getResults(): Promise<Model | Model[]> {
    // @ts-ignore
    return !isBlank(this._farParent.GetAttribute(this._localKey)) ? await this.get() : this._related.NewCollection();
  }

  /* Execute the query as a "select" statement. */
  public async get(columns: any[] = ['*']): Promise<Model | Model[]> {
    const builder = this._prepareQueryBuilder(columns);
    let models = await builder.getModels();
    if (models.length > 0) {
      models = await builder.eagerLoadRelations(models);
    }
    return this._related.NewCollection(models);
  }

  // /*Get a paginator for the "select" statement.*/
  // public paginate(perPage: number | null = null, columns: any[] = ['*'], pageName: string = 'page',
  //                 page: number                                                            = null) {
  //   this._query.addSelect(this.shouldSelect(columns));
  //   return this._query.paginate(perPage, columns, pageName, page);
  // }
  //
  // /*Paginate the given query into a simple paginator.*/
  // public simplePaginate(perPage: number | null                         = null, columns: any[] = ['*'],
  //                       pageName: string = 'page', page: number | null = null) {
  //   this._query.addSelect(this.shouldSelect(columns));
  //   return this._query.simplePaginate(perPage, columns, pageName, page);
  // }

  /* Set the select clause for the relation query. */
  _shouldSelect(columns: any[] = ['*']): string[] {
    if (columns.includes('*')) {
      columns = [this._related.GetTable() + '.*'];
    }
    return [...columns, ...[this.getQualifiedFirstKeyName() + ' as fedaco_through_key']];
  }

  /* Chunk the results of the query. */
  public chunk(count: number, concurrent?: number) {
    return this._prepareQueryBuilder().chunk(count, concurrent);
  }

  /* Chunk the results of a query by comparing numeric IDs. */
  public chunkById(count: number, column?: string, alias?: string) {
    column = column ?? this.getRelated().GetQualifiedKeyName();
    alias = alias ?? this.getRelated().GetKeyName();
    return this._prepareQueryBuilder().chunkById(count, column, alias);
  }

  // /*Get a generator for the given query.*/
  // public cursor() {
  //   return this.prepareQueryBuilder().cursor();
  // }

  /* Execute a callback over each item while chunking. */
  public each(count = 1000, concurrent?: number) {
    return this._prepareQueryBuilder().each(count, concurrent);
  }

  // /*Query lazily, by chunks of the given size.*/
  // public lazy(chunkSize: number = 1000) {
  //   return this.prepareQueryBuilder().lazy(chunkSize);
  // }
  //
  // /*Query lazily, by chunking the results of a query by comparing IDs.*/
  // public lazyById(chunkSize = 1000, column: string | null = null, alias: string | null = null) {
  //   column = column ?? this.getRelated().getQualifiedKeyName();
  //   alias  = alias ?? this.getRelated().getKeyName();
  //   return this.prepareQueryBuilder().lazyById(chunkSize, column, alias);
  // }

  /* Prepare the query builder for query execution. */
  _prepareQueryBuilder(columns: any[] = ['*']): FedacoBuilder {
    const builder = this._query.applyScopes();
    builder.addSelect(this._shouldSelect(builder.getQuery()._columns.length ? [] : columns));
    return builder;
  }

  /* Add the constraints for a relationship query. */
  public getRelationExistenceQuery(
    query: FedacoBuilder,
    parentQuery: FedacoBuilder,
    columns: any[] | any = ['*'],
  ): FedacoBuilder {
    // todo fixme
    if (parentQuery.getModel().GetTable() === query.getModel().GetTable()) {
      return this.getRelationExistenceQueryForSelfRelation(query, parentQuery, columns);
    }
    // todo fixme
    if (parentQuery.getModel().GetTable() === this._throughParent.GetTable()) {
      return this.getRelationExistenceQueryForThroughSelfRelation(query, parentQuery, columns);
    }
    this._performJoin(query);
    return query.select(columns).whereColumn(this.getQualifiedLocalKeyName(), '=', this.getQualifiedFirstKeyName());
  }

  /* Add the constraints for a relationship query on the same table. */
  public getRelationExistenceQueryForSelfRelation(
    query: FedacoBuilder,
    parentQuery: FedacoBuilder,
    columns: any[] | any = ['*'],
  ): FedacoBuilder {
    const hash = this.getRelationCountHash();
    query.from(`${query.getModel().GetTable()} as ${hash}`);
    query.join(this._throughParent.GetTable(), this.getQualifiedParentKeyName(), '=', hash + '.' + this._secondKey);
    if (this.throughParentSoftDeletes()) {
      query.whereNull(this._throughParent.getQualifiedDeletedAtColumn());
    }
    query.getModel().SetTable(hash);
    return query
      .select(columns)
      .whereColumn(parentQuery.getQuery().from + '.' + this._localKey, '=', this.getQualifiedFirstKeyName());
  }

  /* Add the constraints for a relationship query on the same table as the through parent. */
  public getRelationExistenceQueryForThroughSelfRelation(
    query: FedacoBuilder,
    parentQuery: FedacoBuilder,
    columns: any[] | any = ['*'],
  ): FedacoBuilder {
    const hash = this.getRelationCountHash();
    const table = `${this._throughParent.GetTable()} as ${hash}`;
    query.join(table, `${hash}.${this._secondLocalKey}`, '=', this.getQualifiedFarKeyName());
    if (this.throughParentSoftDeletes()) {
      query.whereNull(`${hash}.${this._throughParent.getDeletedAtColumn()}`);
    }
    return query
      .select(columns)
      .whereColumn(`${parentQuery.getQuery().from}.${this._localKey}`, '=', `${hash}.${this._firstKey}`);
  }

  /* Get the qualified foreign key on the related model. */
  public getQualifiedFarKeyName(): string {
    return this.getQualifiedForeignKeyName();
  }

  /* Get the foreign key on the "through" model. */
  public getFirstKeyName(): string {
    return this._firstKey;
  }

  /* Get the qualified foreign key on the "through" model. */
  public getQualifiedFirstKeyName(): string {
    return this._throughParent.QualifyColumn(this._firstKey);
  }

  /* Get the foreign key on the related model. */
  public getForeignKeyName(): string {
    return this._secondKey;
  }

  /* Get the qualified foreign key on the related model. */
  public getQualifiedForeignKeyName(): string {
    return this._related.QualifyColumn(this._secondKey);
  }

  /* Get the local key on the far parent model. */
  public getLocalKeyName(): string {
    return this._localKey;
  }

  /* Get the qualified local key on the far parent model. */
  public getQualifiedLocalKeyName(): string {
    return this._farParent.QualifyColumn(this._localKey);
  }

  /* Get the local key on the intermediary model. */
  public getSecondLocalKeyName(): string {
    return this._secondLocalKey;
  }
}
