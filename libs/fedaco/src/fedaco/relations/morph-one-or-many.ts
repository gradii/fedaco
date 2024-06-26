/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { FedacoBuilder } from '../fedaco-builder';
import type { Model } from '../model';
import { HasOneOrMany } from './has-one-or-many';
import type { Relation } from './relation';

export class MorphOneOrMany extends HasOneOrMany {
  /*The foreign key type for the relationship.*/
  _morphType: string;
  /*
  * The class name of the parent model.
  */
  _morphClass: string;

  /*Create a new morph one or many relationship instance.*/
  public constructor(query: FedacoBuilder,
                     parent: Model,
                     type: string,
                     id: string,
                     localKey: string) {
    super(query, parent, id, localKey);
    this._morphType  = type;
    this._morphClass = parent.GetMorphClass();
    this.addConstraints();
  }

  /*Set the base constraints on the relation query.*/
  public addConstraints() {
    if (this._morphType === undefined && this._morphClass === undefined) {
      // constructor is not init.
      return;
    }
    if ((this.constructor as typeof Relation).constraints) {
      super.addConstraints();
      this._getRelationQuery().where(this._morphType, this._morphClass);
    }
  }

  /*Set the constraints for an eager load of the relation.*/
  public addEagerConstraints(models: Model[]) {
    super.addEagerConstraints(models);
    this._getRelationQuery().where(this._morphType, this._morphClass);
  }

  /*Set the foreign ID and type for creating a related model.*/
  _setForeignAttributesForCreate(model: Model) {
    model.SetAttribute(this.getForeignKeyName(), this.getParentKey());
    model.SetAttribute(this.getMorphType(), this._morphClass);
  }

  /*Get the relationship query.*/
  public getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder,
                                   columns: any[] | any = ['*']) {
    return super.getRelationExistenceQuery(query, parentQuery, columns).where(
      query.qualifyColumn(this.getMorphType()), this._morphClass);
  }

  /*Get the foreign key "type" name.*/
  public getQualifiedMorphType() {
    return this._morphType;
  }

  /*Get the plain morph type name without the table.*/
  public getMorphType() {
    return this._morphType.split('.').pop();
  }

  /*Get the class name of the parent model.*/
  public getMorphClass() {
    return this._morphClass;
  }
}
