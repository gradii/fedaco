/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray } from '@gradii/nanofn';
import { tap } from 'ramda';
import type { FedacoBuilder } from '../fedaco-builder';
import type { Model } from '../model';
import { Pivot } from './pivot';
import type { Relation } from './relation';

export class MorphPivot extends Pivot {
  /*The type of the polymorphic relation.

    Explicitly define this so it's not included in saved attributes.*/
  protected _morphType: string;
  /*The value of the polymorphic relation.

  Explicitly define this so it's not included in saved attributes.*/
  protected _morphClass: string;

  /*Set the keys for a save update query.*/
  _setKeysForSaveQuery(query: FedacoBuilder<this>): FedacoBuilder<this> {
    query.where(this._morphType, this._morphClass);
    return super._setKeysForSaveQuery(query);
  }

  /*Set the keys for a select query.*/
  _setKeysForSelectQuery(query: FedacoBuilder<this>): FedacoBuilder<this> {
    query.where(this._morphType, this._morphClass);
    return super._setKeysForSelectQuery(query);
  }

  /*Delete the pivot model record from the database.*/
  public async $delete() {
    if (this._attributes[this.$getKeyName()] !== undefined) {
      return /*cast type int*/ super.$delete();
    }
    if (this._fireModelEvent('deleting') === false) {
      return 0;
    }
    const query = this._getDeleteQuery();
    query.where(this._morphType, this._morphClass);
    return tap(() => {
      this._fireModelEvent('deleted', false);
    }, await query.delete());
  }

  /*Get the morph type for the pivot.*/
  public $getMorphType() {
    return this._morphType;
  }

  /*Set the morph type for the pivot.*/
  public $setMorphType(morphType: string) {
    this._morphType = morphType;
    return this;
  }

  /*Set the morph class for the pivot.*/
  public $setMorphClass(morphClass: string) {
    this._morphClass = morphClass;
    return this;
  }

  /*Get the queueable identity for the entity.*/
  public $getQueueableId() {
    if (this._attributes[this.$getKeyName()] !== undefined) {
      return this.$getKey();
    }
    return `${this._foreignKey}:${this.$getAttribute(
      this._foreignKey)}:${this._relatedKey}:${this.$getAttribute(
      this._relatedKey)}:${this._morphType}:${this._morphClass}`;
  }

  /*Get a new query to restore one or more models by their queueable IDs.*/
  public $newQueryForRestoration(ids: number[] | string[] | string): FedacoBuilder<this> {
    if (isArray(ids)) {
      return this._newQueryForCollectionRestoration(ids);
    }
    if (!ids.includes(':')) {
      return super.$newQueryForRestoration(ids);
    }
    const segments = ids.split(':');
    return this.$newQueryWithoutScopes().where(
      segments[0], segments[1]
    ).where(
      segments[2], segments[3]
    ).where(segments[4], segments[5]);
  }

  /*Get a new query to restore multiple models by their queueable IDs.*/
  protected newQueryForCollectionRestoration(ids: any[]): FedacoBuilder<this> {
    if (!ids[0].includes(':')) {
      return super.$newQueryForRestoration(ids);
    }
    const query = this.$newQueryWithoutScopes();
    for (const id of ids) {
      const segments = id.split(':');
      query.orWhere((q: Relation) => {
        return q.where(segments[0], segments[1])
          .where(segments[2], segments[3])
          .where(segments[4], segments[5]);
      });
    }
    return query;
  }
}
