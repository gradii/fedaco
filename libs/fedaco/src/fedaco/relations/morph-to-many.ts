/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/nanofn';
import { uniq } from 'ramda';
import type { FedacoBuilder } from '../fedaco-builder';
import type { Model } from '../model';
import { BelongsToMany } from './belongs-to-many';
import { MorphPivot } from './morph-pivot';
import { Relation } from './relation';

export class MorphToMany extends BelongsToMany {
  /*The type of the polymorphic relation.*/
  _morphType: string;
  /*The class name of the morph type constraint.*/
  _morphClass: string;
  /*Indicates if we are connecting the inverse of the relation.

  This primarily affects the morphClass constraint.*/
  _inverse: boolean;

  /*Create a new morph to many relationship instance.*/
  public constructor(query: FedacoBuilder, parent: Model, name: string, table: string,
                     foreignPivotKey: string, relatedPivotKey: string, parentKey: string,
                     relatedKey: string,
                     relationName: string | null = null,
                     inverse                     = false) {
    super(query, parent, table, foreignPivotKey, relatedPivotKey, parentKey, relatedKey,
      relationName);
    this._inverse    = inverse;
    this._morphType  = name + '_type';
    this._morphClass = inverse ?
      query.getModel().$getMorphClass() :
      parent.$getMorphClass();
    this.addConstraints();
  }

  addConstraints() {
    if (this._morphType === undefined && this._morphClass === undefined) {
      // constructor is not init.
      return;
    }

    super.addConstraints();
  }

  /*Set the where clause for the relation query.*/
  _addWhereConstraints() {
    super._addWhereConstraints();
    this._query.where(this.qualifyPivotColumn(this._morphType), this._morphClass);
    return this;
  }

  /*Set the constraints for an eager load of the relation.*/
  public addEagerConstraints(models: Model[]) {
    super.addEagerConstraints(models);
    this._query.where(this.qualifyPivotColumn(this._morphType), this._morphClass);
  }

  /*Create a new pivot attachment record.*/
  _baseAttachRecord(id: number, timed: boolean) {
    const arr = super._baseAttachRecord(id, timed);
    if (isBlank(arr[this._morphType])) {
      arr[this._morphType] = this._morphClass;
    }
    return arr;
  }

  /*Add the constraints for a relationship count query.*/
  public getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder,
                                   columns: any[] | any = ['*']) {
    return super.getRelationExistenceQuery(query, parentQuery, columns).where(
      this.qualifyPivotColumn(this._morphType), this._morphClass);
  }

  /*Get the pivot models that are currently attached.*/
  async _getCurrentlyAttachedPivots() {
    return (await super._getCurrentlyAttachedPivots())
      .map(record => {
        return record instanceof MorphPivot ? record.$setMorphType(this._morphType).$setMorphClass(
          this._morphClass) : record;
      });
  }

  /*Create a new query builder for the pivot table.*/
  public newPivotQuery() {
    return super.newPivotQuery().where(this._morphType, this._morphClass);
  }

  /*Create a new pivot model instance.*/
  public newPivot(attributes: any[] = [], exists: boolean = false) {
    const using = this._using;
    const pivot = using ? using.fromRawAttributes(this._parent, attributes, this._table,
      exists) : MorphPivot.fromAttributes(this._parent, attributes, this._table, exists);
    pivot.$setPivotKeys(this._foreignPivotKey, this._relatedPivotKey)
      .$setMorphType(this._morphType)
      .$setMorphClass(this._morphClass);
    return pivot;
  }

  /*Get the pivot columns for the relation.

  "pivot_" is prefixed at each column for easy removal later.*/
  _aliasedPivotColumns() {
    const defaults = [this._foreignPivotKey, this._relatedPivotKey, this._morphType];
    return uniq([...defaults, ...this._pivotColumns].map(column => {
      return this.qualifyPivotColumn(column) + ' as pivot_' + column;
    }));
  }

  /*Get the foreign key "type" name.*/
  public getMorphType() {
    return this._morphType;
  }

  /*Get the class name of the parent model.*/
  public getMorphClass() {
    return this._morphClass;
  }

  /*Get the indicator for a reverse relationship.*/
  public getInverse() {
    return this._inverse;
  }
}
