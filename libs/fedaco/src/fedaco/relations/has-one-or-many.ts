/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank, last, tap } from '@gradii/nanofn';
import type { Collection } from '../../define/collection';
import type { Constructor } from '../../helper/constructor';
import type { FedacoBuilder } from '../fedaco-builder';
import type { Model } from '../model';
import { mixinInteractsWithDictionary } from './concerns/interacts-with-dictionary';
import { Relation } from './relation';

export interface HasOneOrMany extends Constructor<Relation> {
  // foreignKey: string;
  // localKey: string;
  make(attributes?: any): any;
  makeMany(records: []): any;
  addConstraints(): void;
  addEagerConstraints(models: Model[]): void;
  matchOne(models: Model[], results: Collection, relation: string): any[];
  matchMany(models: Model[], results: Collection, relation: string): any[];
  matchOneOrMany(models: Model[], results: Collection, relation: string, type: string): any[];
  getRelationValue(dictionary: any, key: string, type: string): any;
  buildDictionary(results: Collection): any;
  findOrNew(id: any, columns?: any[]): Promise<any>;
  firstOrNew(attributes?: any, values?: any): Promise<any>;
  firstOrCreate(attributes?: any, values?: any): Promise<any>;
  updateOrCreate(attributes: any, values?: any): Promise<any>;
  save(model: Model): Promise<any>;
  saveMany(models: Model[]): Promise<any[]>;
  create(attributes?: any): Promise<any>;
  createMany(records: any[]): Promise<any>;
  // _setForeignAttributesForCreate(model: Model): void;
  getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): any;
  getRelationExistenceQueryForSelfRelation(
    query: FedacoBuilder,
    parentQuery: FedacoBuilder,
    columns?: any[] | any,
  ): any;
  getExistenceCompareKey(): string;
  getParentKey(): any;
  getQualifiedParentKeyName(): any;
  getForeignKeyName(): any;
  getQualifiedForeignKeyName(): string;
  getLocalKeyName(): string;
}

export class HasOneOrMany extends mixinInteractsWithDictionary(Relation) {
  /* The foreign key of the parent model. */
  protected _foreignKey: string;
  /* The local key of the parent model. */
  protected _localKey: string;

  /* Create a new has one or many relationship instance. */
  public constructor(query: FedacoBuilder, parent: Model, foreignKey: string, localKey: string) {
    super(query, parent);
    this._localKey = localKey;
    this._foreignKey = foreignKey;
    this.addConstraints();
  }

  /* Create and return an un-saved instance of the related model. */
  public make(attributes: any = {}) {
    return tap((instance) => {
      this._setForeignAttributesForCreate(instance);
    }, this._related.NewInstance(attributes));
  }

  /* Create and return an un-saved instance of the related models. */
  public makeMany(records: []) {
    const instances = this._related.NewCollection();
    for (const record of records) {
      instances.push(this.make(record));
    }
    return instances;
  }

  /* Set the base constraints on the relation query. */
  public addConstraints() {
    if ((this.constructor as typeof HasOneOrMany).constraints) {
      const query = this._getRelationQuery();
      query.where(this._foreignKey, '=', this.getParentKey());
      query.whereNotNull(this._foreignKey);
    }
  }

  /* Set the constraints for an eager load of the relation. */
  public addEagerConstraints(models: Model[]) {
    const whereIn = this._whereInMethod(this._parent, this._localKey);
    this._getRelationQuery()[whereIn](this._foreignKey, this.getKeys(models, this._localKey));
  }

  /* Match the eagerly loaded results to their single parents. */
  public matchOne(models: Model[], results: Collection, relation: string) {
    return this.matchOneOrMany(models, results, relation, 'one');
  }

  /* Match the eagerly loaded results to their many parents. */
  public matchMany(models: Model[], results: Collection, relation: string) {
    return this.matchOneOrMany(models, results, relation, 'many');
  }

  /* Match the eagerly loaded results to their many parents. */
  /* protected */ matchOneOrMany(models: Model[], results: Collection, relation: string, type: string) {
    const dictionary = this.buildDictionary(results);
    for (const model of models) {
      const key = this._getDictionaryKey(model.GetAttribute(this._localKey));
      if (dictionary[key] !== undefined) {
        model.SetRelation(relation, this.getRelationValue(dictionary, key, type));
      }
    }
    return models;
  }

  /* Get the value of a relationship by one or many type. */
  /* protected */ getRelationValue(dictionary: any, key: string, type: string) {
    const value = dictionary[key];
    return type === 'one' ? value[0] : this._related.NewCollection(value);
  }

  /* Build model dictionary keyed by the relation's foreign key. */
  /* protected */ buildDictionary(results: Collection) {
    const foreign = this.getForeignKeyName();
    return results.reduce((prev: any, result) => {
      // @ts-ignore
      const key = this._getDictionaryKey(result.GetAttribute(foreign));
      if (!prev[key]) {
        prev[key] = [];
      }
      prev[key].push(result);
      return prev;
    }, {});
  }

  /* Find a model by its primary key or return a new instance of the related model. */
  public async findOrNew(id: any, columns: any[] = ['*']) {
    let instance = await this.find(id, columns);
    if (isBlank(instance)) {
      instance = this._related.NewInstance();
      this._setForeignAttributesForCreate(instance);
    }
    return instance;
  }

  /* Get the first related model record matching the attributes or instantiate it. */
  public async firstOrNew(attributes: Record<string, any> = {}, values: any = {}) {
    let instance = (await this.where(attributes).first()) as Model;
    if (isBlank(instance)) {
      instance = this._related.NewInstance({ ...attributes, ...values });
      this._setForeignAttributesForCreate(instance);
    }
    return instance;
  }

  /* Get the first related record matching the attributes or create it. */
  public async firstOrCreate(attributes: Record<string, any> = {}, values: any = {}) {
    let instance = await this.where(attributes).first();
    if (isBlank(instance)) {
      instance = await this.create({ ...attributes, ...values });
    }
    return instance;
  }

  /* Create or update a related record matching the attributes, and fill it with values. */
  public async updateOrCreate(attributes: any, values: any = {}) {
    const instance: Model = await this.firstOrNew(attributes);
    await instance.Fill(values);
    await instance.Save();

    return instance;
  }

  /* Attach a model instance to the parent model. */
  public async save(model: Model) {
    this._setForeignAttributesForCreate(model);
    return (await model.Save()) ? model : false;
  }

  /* Attach a collection of models to the parent instance. */
  public async saveMany(models: Model[]) {
    for (const model of models) {
      await this.save(model);
    }
    return models;
  }

  /* Create a new instance of the related model. */
  public async create(attributes: any = {}) {
    const instance = this._related.NewInstance(attributes);
    this._setForeignAttributesForCreate(instance);
    await instance.Save();
    return instance;
  }

  /* Create a Collection of new instances of the related model. */
  public async createMany(records: any[]) {
    const instances = this._related.NewCollection();
    for (const record of records) {
      instances.push(await this.create(record));
    }
    return instances;
  }

  /* Set the foreign ID for creating a related model. */
  _setForeignAttributesForCreate(model: Model) {
    model.SetAttribute(this.getForeignKeyName(), this.getParentKey());
  }

  /* Add the constraints for a relationship query. */
  public getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder, columns: any[] | any = ['*']) {
    // if (query.getQuery()._from == parentQuery.getQuery()._from) {
    // refactor try to use get table
    if (query.getModel().GetTable() == parentQuery.getModel().GetTable()) {
      return this.getRelationExistenceQueryForSelfRelation(query, parentQuery, columns);
    }
    return super.getRelationExistenceQuery(query, parentQuery, columns);
  }

  /* Add the constraints for a relationship query on the same table. */
  public getRelationExistenceQueryForSelfRelation(
    query: FedacoBuilder,
    parentQuery: FedacoBuilder,
    columns: any[] | any = ['*'],
  ) {
    const hash = this.getRelationCountHash();
    query.from(`${query.getModel().GetTable()} as ${hash}`);
    query.getModel().SetTable(hash);
    return query
      .select(columns)
      .whereColumn(this.getQualifiedParentKeyName(), '=', `${hash}.${this.getForeignKeyName()}`);
  }

  /* Get the key for comparing against the parent key in "has" query. */
  public getExistenceCompareKey() {
    return this.getQualifiedForeignKeyName();
  }

  /* Get the key value of the parent's local key. */
  public getParentKey() {
    return this._parent.GetAttribute(this._localKey);
  }

  /* Get the fully qualified parent key name. */
  public getQualifiedParentKeyName() {
    return this._parent.QualifyColumn(this._localKey);
  }

  /* Get the plain foreign key. */
  public getForeignKeyName() {
    const segments = this.getQualifiedForeignKeyName().split('.');
    return last(segments);
  }

  /* Get the foreign key for the relationship. */
  public getQualifiedForeignKeyName() {
    return this._foreignKey;
  }

  /* Get the local key for the relationship. */
  public getLocalKeyName() {
    return this._localKey;
  }
}
