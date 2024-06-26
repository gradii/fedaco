/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank, isObject } from '@gradii/nanofn';
import { last, uniq } from 'ramda';
import type { Collection } from '../../define/collection';
import { raw } from '../../query-builder/ast-factory';
import type { FedacoBuilder } from '../fedaco-builder';
import { mixinForwardCallToQueryBuilder } from '../mixins/forward-call-to-query-builder';
import type { Model } from '../model';

// export interface Relation extends ForwardCallToQueryBuilder {
// }

/**
 * select * from table where col = ? and col2 = ?;
 */
export class Relation extends mixinForwardCallToQueryBuilder(class {
}) {
  /*The Eloquent query builder instance.*/
  _query: FedacoBuilder;
  /*The parent model instance.*/
  _parent: Model;
  /*The related model instance.*/
  _related: Model;
  /*Indicates if the relation is adding constraints.*/
  protected static constraints = true;
  /*An array to map class names to their morph names in the database.*/
  public static _morphMap: any = {};
  /*The count of self joins.*/
  protected static selfJoinCount = 0;

  /*Create a new relation instance.*/
  public constructor(query: FedacoBuilder, parent: Model) {
    super();
    this._query   = query;
    this._parent  = parent;
    this._related = query.getModel();
    // this.addConstraints();
  }

  /*Run a callback with constraints disabled on the relation.*/
  public static noConstraints<T extends Relation>(callback: (...args: any[]) => T): T {
    const previous       = Relation.constraints;
    Relation.constraints = false;
    let rst: T;
    try {
      rst = callback();
    } catch (e) {
      console.log(e);
    } finally {
      Relation.constraints = previous;
    }

    return rst;
  }

  /*Set the base constraints on the relation query.*/
  public addConstraints() {
    throw new Error('not implemented');
  }

  /*Set the constraints for an eager load of the relation.*/
  public addEagerConstraints(models: Model[]) {
    throw new Error('not implemented');
  }

  /*Initialize the relation on a set of models.*/
  public initRelation(models: Model[], relation: string): Model[] {
    throw new Error('not implemented');
  }

  /*Match the eagerly loaded results to their parents.*/
  public match(models: Model[], results: Collection, relation: string): Model[] {
    throw new Error('not implemented');
  }

  /*Get the results of the relationship.*/
  public getResults(): Promise<Model | Model[]> {
    throw new Error('not implemented');
  }

  /*Get the relationship for eager loading.*/
  public async getEager(): Promise<any | any[]> {
    return this.get();
  }

  /*Execute the query and get the first result if it's the sole matching record.*/
  public async sole(columns: any[] | string = ['*']) {
    const result = await this.take(2).get(columns);
    if (!result.length) {
      throw new Error(`ModelNotFoundException().setModel(get_class(this._related))`);
    }
    if (result.length > 1) {
      throw new Error(`MultipleRecordsFoundException()`);
    }
    return result.pop();
  }

  /*Execute the query as a "select" statement.*/
  public async get(columns: string[] | string = ['*']): Promise<any | any[]> {
    return this._query.get(columns);
  }

  /*Touch all of the related models for the relationship.*/
  public async Touch() {
    const model = this.getRelated();
    if (!(model.constructor as typeof Model).isIgnoringTouch()) {
      await this.rawUpdate({
        [model.GetUpdatedAtColumn()]: model.FreshTimestampString()
      });
    }
  }

  /*Run a raw update against the base query.*/
  public rawUpdate(attributes: any) {
    return this._query.withoutGlobalScopes().update(attributes);
  }

  /*Add the constraints for a relationship count query.*/
  public getRelationExistenceCountQuery(query: FedacoBuilder, parentQuery: FedacoBuilder) {
    return this.getRelationExistenceQuery(query, parentQuery,
      raw('count(*)'));
  }

  /*Add the constraints for an internal relationship existence query.

  Essentially, these queries compare on column names like whereColumn.*/
  public getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder,
                                   columns: any[] | any = ['*']): FedacoBuilder {
    return query.select(columns)
      .whereColumn(
        this.getQualifiedParentKeyName(),
        '=',
        this.getExistenceCompareKey()
      );
  }

  getExistenceCompareKey(): string {
    throw new Error('not implemented');
  }

  /*Get a relationship join table hash.*/
  public getRelationCountHash(incrementJoinCount = true) {
    return 'fedaco_reserved_' + (incrementJoinCount ? Relation.selfJoinCount++ : Relation.selfJoinCount);
  }

  /*Get all of the primary keys for an array of models.*/

  /*protected */
  getKeys(models: Model[], key: string | null = null) {
    return uniq(models.map(value => {
      return key ? value.GetAttribute(key) : value.GetKey();
    })).sort();
  }

  /*Get the query builder that will contain the relationship constraints.*/
  _getRelationQuery() {
    return this._query;
  }

  /*Get the underlying query for the relation.*/
  public getQuery() {
    return this._query;
  }

  /*Get the base query builder driving the Eloquent builder.*/
  public getBaseQuery() {
    return this.toBase();
  }

  /*Get a base query builder instance.*/
  public toBase() {
    return this._query.getQuery();
  }

  /*Get the parent model of the relation.*/
  public getParent() {
    return this._parent;
  }

  /*Get the fully qualified parent key name.*/
  public getQualifiedParentKeyName() {
    return this._parent.GetQualifiedKeyName();
  }

  /*Get the related model of the relation.*/
  public getRelated(): Model {
    return this._related;
  }

  /*Get the name of the "created at" column.*/
  public createdAt() {
    return this._parent.GetCreatedAtColumn();
  }

  /*Get the name of the "updated at" column.*/
  public updatedAt() {
    return this._parent.GetUpdatedAtColumn();
  }

  /*Get the name of the related model's "updated at" column.*/
  public relatedUpdatedAt() {
    return this._related.GetUpdatedAtColumn();
  }

  /*Get the name of the "where in" method for eager loading.*/
  _whereInMethod(model: Model, key: string): 'whereIntegerInRaw' | 'whereIn' {
    return model.GetKeyName() === last(key.split('.')) &&
    ['int', 'integer'].includes(model.GetKeyType()) ? 'whereIntegerInRaw' : 'whereIn';
  }

  public whereKey(id: any) {
    this._query.whereKey(id);
    return this;
  }

  /*Set or get the morph map for polymorphic relations.*/
  public static morphMap(map: any | null = null, merge = true) {
    map = Relation.buildMorphMapFromModels(map);
    if (isObject(map)) {
      Relation._morphMap = merge && Relation._morphMap ? {...map, ...Relation._morphMap} : map;
    }
    return Relation._morphMap;
  }

  /*Builds a table-keyed array from model class names.*/
  protected static buildMorphMapFromModels(models: any | Array<typeof Model> | null = null) {
    if (isBlank(models) || isObject(models)) {
      return models;
    }
    return (models as (typeof Model)[]).reduce((prev: any, clazz: typeof Model) => {
      const table = new clazz().GetTable();
      prev[table] = clazz;
      return prev;
    }, {});
  }

  /*Get the model associated with a custom polymorphic type.*/
  public static getMorphedModel(alias: string) {
    // @ts-ignore
    return Relation._morphMap[alias] ?? null;
  }

  // /*Handle dynamic method calls to the relationship.*/
  // public __call(method: string, parameters: any[]) {
  //   if (Relation.hasMacro(method)) {
  //     return this.macroCall(method, parameters);
  //   }
  //   var result = this.forwardCallTo(this.query, method, parameters);
  //   if (result === this.query) {
  //     return this;
  //   }
  //   return result;
  // }
  // /*Force a clone of the underlying query builder when cloning.*/
  // public __clone() {
  //   this.query = ();
  // }
}
