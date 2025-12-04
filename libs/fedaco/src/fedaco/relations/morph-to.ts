/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { reflector } from '@gradii/annotation';
import { camelCase, findLast, isBlank, tap } from '@gradii/nanofn';
import { MorphToColumn } from '../../annotation/relation-column/morph-to.relation-column';
import type { Collection } from '../../define/collection';
import { resolveForwardRef } from '../../query-builder/forward-ref';
import { BaseModel } from '../base-model';
import type { FedacoBuilder } from '../fedaco-builder';
import type { Model } from '../model';
import { BelongsTo } from './belongs-to';
import { Relation } from './relation';

export class MorphTo extends BelongsTo {
  /* The type of the polymorphic relation. */
  protected _morphType: string;
  /* The models whose relations are being eager loaded. */
  protected _models: Collection;
  /* All of the models keyed by ID. */
  protected _dictionary: Record<any, any> = {};
  /* A buffer of dynamic calls to query macros. */
  protected _macroBuffer: any[] = [];
  /* A map of relations to load for each individual morph type. */
  protected _morphableEagerLoads: Map<any, any> = new Map();
  /* A map of relationship counts to load for each individual morph type. */
  protected _morphableEagerLoadCounts: Map<any, any> = new Map();
  /* A map of constraints to apply for each individual morph type. */
  protected _morphableConstraints: Map<any, any> = new Map();

  /* Create a new morph to relationship instance. */
  public constructor(
    query: FedacoBuilder,
    parent: Model,
    foreignKey: string,
    ownerKey: string,
    type: string,
    relation: string,
  ) {
    super(query, parent, foreignKey, ownerKey, relation);
    this._morphType = type;
  }

  /* {@inheritdoc} */
  public select(columns = ['*']) {
    this._macroBuffer.push({
      method    : 'select',
      parameters: [columns],
    });
    return super.select(columns);
  }

  /* {@inheritdoc} */
  public selectRaw(expression: string, bindings: any = {}) {
    this._macroBuffer.push({
      method    : 'selectRaw',
      parameters: [expression, bindings],
    });
    return super.selectRaw(expression, bindings);
  }

  /* {@inheritdoc} */
  public selectSub(query: any, as: string) {
    this._macroBuffer.push({
      method    : 'selectSub',
      parameters: [query, as],
    });
    return super.selectSub(query, as);
  }

  /* {@inheritdoc} */
  public addSelect(column: any) {
    this._macroBuffer.push({
      method    : 'addSelect',
      parameters: [column],
    });
    return super.addSelect(column);
  }

  /* Specify constraints on the query for a given morph type. */
  public withoutGlobalScopes(scopes?: any[]) {
    this._macroBuffer.push({
      method    : 'addSelect',
      parameters: [scopes],
    });
    // return super.withoutGlobalScopes(parameters);
  }

  /* Set the constraints for an eager load of the relation. */
  public addEagerConstraints(models: Model[]) {
    this.buildDictionary((this._models = models));
  }

  /* Build a dictionary with the models. */
  protected buildDictionary(models: Collection) {
    for (const model of models) {
      const morphTypeValue = model.GetAttribute(this._morphType);
      const foreignKeyValue = model.GetAttribute(this._foreignKey);
      if (morphTypeValue) {
        const morphTypeKey = this._getDictionaryKey(morphTypeValue);
        const foreignKeyKey = this._getDictionaryKey(foreignKeyValue);

        let obj: Record<string, any> = this._dictionary[morphTypeKey];
        if (!obj) {
          obj = {};
          this._dictionary[morphTypeKey] = obj;
        }
        if (!obj[foreignKeyKey]) {
          obj[foreignKeyKey] = [];
        }
        obj[foreignKeyKey].push(model);
      }
    }
  }

  /* Get the results of the relationship.

  Called via eager load method of Eloquent query builder. */
  public async getEager(): Promise<Collection> {
    for (const type of Object.keys(this._dictionary)) {
      // @ts-ignore todo fixme
      this.matchToMorphParents(type, await this.getResultsByType(type));
    }
    return this._models;
  }

  /* Get all of the relation results for a type. */
  protected async getResultsByType(clazz: string) {
    const instance: Model = this.createModelByType(clazz);
    const ownerKey = this._ownerKey ?? instance.GetKeyName();
    const query = this.replayMacros(instance.NewQuery())
      .mergeConstraintsFrom(this.getQuery())
      .with({
        ...this.getQuery().getEagerLoads(),
        ...(this._morphableEagerLoads.get(/* static */ instance.constructor) ?? {}),
      })
      .withCount(/* cast type array */ this._morphableEagerLoadCounts.get(/* static */ instance.constructor) ?? []);
    const callback = this._morphableConstraints.get(/* static */ instance.constructor) ?? null;
    if (callback) {
      callback(query);
    }
    const whereIn = this._whereInMethod(instance, ownerKey);
    return query[whereIn](
      instance.GetTable() + '.' + ownerKey,
      this.gatherKeysByType(clazz, instance.GetKeyType()),
    ).get();
  }

  /* Gather all of the foreign keys for a given type. */
  protected gatherKeysByType(type: string, keyType: string) {
    return keyType !== 'string'
      ? Object.keys(this._dictionary[type])
      : Object.keys(this._dictionary[type]).map((modelId) => {
          return /* cast type string */ modelId;
        });
  }

  _getActualClassNameForMorph(key: string) {
    const morphMap = Relation.morphMap();
    if (key in morphMap) {
      return morphMap[key];
    }
    // todo fixme this morphType can be custom defined in annotation
    const propertyKey = camelCase(this._morphType.replace(/_type$/, ''));
    const metas = reflector.propMetadata(this._child.constructor)[propertyKey];
    if (metas) {
      const meta = findLast((it) => MorphToColumn.isTypeOf(it), metas);
      const morphTypeMap = meta['morphTypeMap'];
      if (morphTypeMap && morphTypeMap[key]) {
        return resolveForwardRef(morphTypeMap[key]);
      }
    }

    throw new Error(`can't found morph map from [${key}] from Relation.morphMap and column decoration`);
  }

  /* Create a new model instance by type. */
  public createModelByType(type: string) {
    const clazz: typeof Model = this._getActualClassNameForMorph(type);
    // reflector.propMetadata(this._models)

    return tap(new clazz(), (instance) => {
      if (!instance.GetConnectionName()) {
        instance.SetConnection(this.getConnection().getName());
      }
    });
  }

  /* Match the eagerly loaded results to their parents. */
  public match(models: Model[], results: Collection, relation: string) {
    return models;
  }

  /* Match the results for a given type to their parents. */
  protected matchToMorphParents(type: string, results: Collection) {
    for (const result of results) {
      const ownerKey = !isBlank(this._ownerKey) ? this._getDictionaryKey(result[this._ownerKey]) : result.GetKey();
      if (this._dictionary[type][ownerKey] !== undefined) {
        for (const model of this._dictionary[type][ownerKey]) {
          (model as Model).SetRelation(this._relationName, result);
        }
      }
    }
  }

  /* Associate the model instance to the given parent. */
  public associate(model: Model) {
    let foreignKey,
      foreignKeyValue = null,
      morphClass = null;
    if (model instanceof BaseModel) {
      foreignKey = this._ownerKey && model[this._ownerKey] ? this._ownerKey : model.GetKeyName();
      foreignKeyValue = model[foreignKey];
      morphClass = model.GetMorphClass();
    }
    this._parent.SetAttribute(this._foreignKey, foreignKeyValue);
    this._parent.SetAttribute(this._morphType, morphClass);
    return this._parent.SetRelation(this._relationName, model);
  }

  /* Dissociate previously associated model from the given parent. */
  public dissociate() {
    this._parent.SetAttribute(this._foreignKey, null);
    this._parent.SetAttribute(this._morphType, null);
    return this._parent.SetRelation(this._relationName, null);
  }

  /* Touch all of the related models for the relationship. */
  public async Touch() {
    if (!isBlank(this._child._getAttributeFromArray(this._foreignKey))) {
      await super.Touch();
    }
  }

  /* Make a new related instance for the given model. */
  protected newRelatedInstanceFor(parent: Model) {
    return parent.NewRelation(this.getRelationName()).getRelated().NewInstance();
  }

  /* Get the foreign key "type" name. */
  public getMorphType() {
    return this._morphType;
  }

  /* Get the dictionary used by the relationship. */
  public getDictionary() {
    return this._dictionary;
  }

  /* Specify which relations to load for a given morph type. */
  public morphWith(_with: Map<any, any>) {
    _with.forEach((k, v) => {
      this._morphableEagerLoads.set(k, v);
    });
    return this;
  }

  /* Specify which relationship counts to load for a given morph type. */
  public morphWithCount(withCount: Map<any, any>) {
    withCount.forEach((k, v) => {
      this._morphableEagerLoadCounts.set(k, v);
    });
    return this;
  }

  /* Specify constraints on the query for a given morph type. */
  public constrain(callbacks: Map<any, any>) {
    callbacks.forEach((k, v) => {
      this._morphableConstraints.set(k, v);
    });
    return this;
  }

  /* Replay stored macro calls on the actual related instance. */
  protected replayMacros(query: FedacoBuilder) {
    for (const macro of this._macroBuffer) {
      // @ts-ignore
      query[macro['method']](...macro['parameters']);
    }
    return query;
  }

  // /*Handle dynamic method calls to the relationship.*/
  // public __call(method: string, parameters: any[]) {
  //   try {
  //     var result = super.__call(method, parameters);
  //     if (method === "withoutGlobalScopes") {
  //       this.macroBuffer.push(compact("method", "parameters"));
  //     }
  //     return result;
  //   }
  //   catch (e: BadMethodCallException) {
  //     this.macroBuffer.push(compact("method", "parameters"));
  //     return this;
  //   }
  // }
}
