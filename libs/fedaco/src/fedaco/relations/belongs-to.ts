/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/check-type';
import { uniq } from 'ramda';
import type { Collection } from '../../define/collection';
import type { Constructor } from '../../helper/constructor';
import { BaseModel } from '../base-model';
import type { FedacoBuilder } from '../fedaco-builder';
import type { Model } from '../model';
import type {
  ComparesRelatedModels} from './concerns/compares-related-models';
import { mixinComparesRelatedModels
} from './concerns/compares-related-models';
import type {
  InteractsWithDictionary} from './concerns/interacts-with-dictionary';
import { mixinInteractsWithDictionary
} from './concerns/interacts-with-dictionary';
import type { SupportsDefaultModels
} from './concerns/supports-default-models';
import {
  mixinSupportsDefaultModels
} from './concerns/supports-default-models';
import { Relation } from './relation';

export interface BelongsTo extends ComparesRelatedModels, InteractsWithDictionary,
  SupportsDefaultModels, Constructor<Relation> {

  getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder,
                            columns: any[] | any): FedacoBuilder;
}

export class BelongsTo extends mixinComparesRelatedModels(
  mixinInteractsWithDictionary(
    mixinSupportsDefaultModels(
      Relation
    )
  )
) {
  /*The child model instance of the relation.*/
  protected _child: Model;
  /*The foreign key of the parent model.*/
  protected _foreignKey: string;
  /*The associated key on the parent model.*/
  protected _ownerKey: string;
  /*The name of the relationship.*/
  protected _relationName: string;

  /*Create a new belongs to relationship instance.*/
  public constructor(query: FedacoBuilder,
                     child: Model,
                     foreignKey: string,
                     ownerKey: string,
                     relationName: string) {
    super(query, child);
    this._ownerKey     = ownerKey;
    this._relationName = relationName;
    this._foreignKey   = foreignKey;
    this._child        = child;
    this.addConstraints();
  }

  /*Get the results of the relationship.*/
  public async getResults() {
    if (isBlank(this._child.getAttribute(this._foreignKey))) {
      return this._getDefaultFor(this._parent);
    }
    return await this._query.first() || this._getDefaultFor(this._parent);
  }

  /*Set the base constraints on the relation query.*/
  public addConstraints() {
    if ((this.constructor as typeof BelongsTo).constraints) {
      const table = this._related.getTable();
      this._query.where(
        `${table}.${this._ownerKey}`,
        '=',
        this._child.getAttribute(this._foreignKey));
    }
  }

  /*Set the constraints for an eager load of the relation.*/
  public addEagerConstraints(models: any[]) {
    const key     = `${this._related.getTable()}.${this._ownerKey}`;
    const whereIn = this._whereInMethod(this._related, this._ownerKey);
    this._query[whereIn](key, this.getEagerModelKeys(models));
  }

  /*Gather the keys from an array of related models.*/
  protected getEagerModelKeys(models: any[]) {
    const keys = [];
    for (const model of models) {
      const value = model.getAttribute(this._foreignKey);
      if (!isBlank(value)) {
        keys.push(value);
      }
    }
    // keys.sort();
    return uniq(keys);
  }

  /*Initialize the relation on a set of models.*/
  public initRelation(models: any[], relation: string) {
    for (const model of models) {
      model.setRelation(relation, this._getDefaultFor(model));
    }
    return models;
  }

  /*Match the eagerly loaded results to their parents.*/
  public match(models: any[], results: Collection, relation: string) {
    const foreign    = this._foreignKey;
    const owner      = this._ownerKey;
    const dictionary: Record<string, any> = {};
    for (const result of results) {
      const attribute       = this._getDictionaryKey(result.getAttribute(owner));
      dictionary[attribute] = result;
    }
    for (const model of models) {
      const attribute = this._getDictionaryKey(model.getAttribute(foreign));
      if (dictionary[attribute] !== undefined) {
        model.setRelation(relation, dictionary[attribute]);
      }
    }
    return models;
  }

  /*Associate the model instance to the given parent.*/
  public associate(model: Model | number | string) {
    const ownerKey = model instanceof BaseModel ?
      model.getAttribute(this._ownerKey) : model;
    this._child.setAttribute(this._foreignKey, ownerKey);
    if (model instanceof BaseModel) {
      this._child.setRelation(this._relationName, model);
    } else {
      this._child.unsetRelation(this._relationName);
    }
    return this._child;
  }

  /*Dissociate previously associated model from the given parent.*/
  public dissociate() {
    this._child.setAttribute(this._foreignKey, null);
    return this._child.setRelation(this._relationName, null);
  }

  /*Alias of "dissociate" method.*/
  public disassociate() {
    return this.dissociate();
  }

  /*Add the constraints for a relationship query.*/
  public getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder,
                                   columns: any[] | any = ['*']): FedacoBuilder {
    // todo check
    if (parentQuery.getModel().getTable() == query.getModel().getTable()) {
      return this.getRelationExistenceQueryForSelfRelation(query, parentQuery, columns);
    }
    return query.select(columns).whereColumn(
      this.getQualifiedForeignKeyName(), '=', query.qualifyColumn(this._ownerKey)
    );
  }

  /*Add the constraints for a relationship query on the same table.*/
  public getRelationExistenceQueryForSelfRelation(query: FedacoBuilder, parentQuery: FedacoBuilder,
                                                  columns: any[] | any = ['*']): FedacoBuilder {
    const hash = this.getRelationCountHash();
    query.select(columns).from(query.getModel().getTable() + ' as ' + hash);
    query.getModel().setTable(hash);
    return (query as FedacoBuilder).whereColumn(`${hash}.${this._ownerKey}`, '=', this.getQualifiedForeignKeyName());
  }

  /*Determine if the related model has an auto-incrementing ID.*/
  protected relationHasIncrementingId() {
    return this._related.getIncrementing() && ['int', 'integer'].includes(
      this._related.getKeyType());
  }

  /*Make a new related instance for the given model.*/
  protected newRelatedInstanceFor(parent: Model) {
    return this._related.newInstance();
  }

  /*Get the child of the relationship.*/
  public getChild() {
    return this._child;
  }

  /*Get the foreign key of the relationship.*/
  public getForeignKeyName() {
    return this._foreignKey;
  }

  /*Get the fully qualified foreign key of the relationship.*/
  public getQualifiedForeignKeyName() {
    return this._child.qualifyColumn(this._foreignKey);
  }

  /*Get the key value of the child's foreign key.*/
  public getParentKey() {
    return this._child[this._foreignKey];
  }

  /*Get the associated key of the relationship.*/
  public getOwnerKeyName() {
    return this._ownerKey;
  }

  /*Get the fully qualified associated key of the relationship.*/
  public getQualifiedOwnerKeyName() {
    return this._related.qualifyColumn(this._ownerKey);
  }

  /*Get the value of the model's associated key.*/
  _getRelatedKeyFrom(model: Model) {
    return model[this._ownerKey];
  }

  /*Get the name of the relationship.*/
  public getRelationName() {
    return this._relationName;
  }
}
