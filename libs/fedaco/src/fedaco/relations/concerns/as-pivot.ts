/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { reflector } from '@gradii/annotation';
import { isArray, isBlank } from '@gradii/nanofn';
import { findLast, tap } from 'ramda';
import type { TableAnnotation } from '../../../annotation/table/table';
import { Table } from '../../../annotation/table/table';
import type { Constructor } from '../../../helper/constructor';
import { singular } from '@gradii/nanofn';
import type { QueryBuilder } from '../../../query-builder/query-builder';
import type { FedacoBuilder } from '../../fedaco-builder';
import type { Model } from '../../model';
import { Pivot } from '../pivot';

// tslint:disable-next-line:no-namespace
export declare namespace AsPivot {
  /*Create a new pivot model instance.*/
  export function fromAttributes(parent: Model, attributes: any[], table: string,
                                 exists?: boolean): any;

  /*Create a new pivot model from raw values returned from a query.*/
  export function fromRawAttributes(
    parent: Model, attributes: any, table: string, exists: boolean): any;
}

export interface AsPivot extends Model {
  /*The parent model of the relationship.*/
  pivotParent: Model;
  /*The name of the foreign key column.*/
  _foreignKey: string;
  /*The name of the "other key" column.*/
  _relatedKey: string;

  /*Set the keys for a select query.*/
  _setKeysForSelectQuery(query: FedacoBuilder<this>): FedacoBuilder<this>;

  /*Set the keys for a save update query.*/
  _setKeysForSaveQuery(query: FedacoBuilder<this>): FedacoBuilder<this>;

  /*Delete the pivot model record from the database.*/
  $delete(): Promise<number | boolean>;

  /*Get the query builder for a delete operation on the pivot.*/
  _getDeleteQuery(): FedacoBuilder;

  /*Get the table associated with the model.*/
  $getTable(): string;

  $setTable(tableName: string): this;

  /*Get the foreign key column name.*/
  $getForeignKey(): string;

  /*Get the "related key" column name.*/
  $getRelatedKey(): string;

  /*Get the "related key" column name.*/
  $getOtherKey(): string;

  /*Set the key names for the pivot model instance.*/
  $setPivotKeys(foreignKey: string, relatedKey: string): this;

  /*Determine if the pivot model or given attributes has timestamp attributes.*/
  $hasTimestampAttributes(attributes?: any[] | null): boolean;

  /*Get the name of the "created at" column.*/
  $getCreatedAtColumn(): string;

  /*Get the name of the "updated at" column.*/
  $getUpdatedAtColumn(): string;

  /*Get the queueable identity for the entity.*/
  $getQueueableId(): number | string;

  /*Get a new query to restore one or more models by their queueable IDs.*/
  $newQueryForRestoration(ids: number[] | string[] | string): FedacoBuilder<this>;

  /*Get a new query to restore multiple models by their queueable IDs.*/
  _newQueryForCollectionRestoration(ids: number[] | string[]): FedacoBuilder<this>;

  /*Unset all the loaded relations for the instance.*/
  $unsetRelations(): this;
}

export type AsPivotCtor = Constructor<AsPivot>;

export function mixinAsPivot<T extends Constructor<any>>(base: T): AsPivotCtor & T {
  return class _Self extends base {
    /*The parent model of the relationship.*/
    public pivotParent: Model;
    /*The name of the foreign key column.*/
    _foreignKey: string;
    /*The name of the "other key" column.*/
    _relatedKey: string;

    /*Create a new pivot model instance.*/
    public static fromAttributes(parent: Model, attributes: any[], table: string,
                                 exists = false) {
      const instance: Model & Pivot & AsPivot = new this();
      instance._timestamps                    = instance.$hasTimestampAttributes(attributes);
      instance.$setConnection(parent.$getConnectionName())
        .$setTable(table)
        .$forceFill(attributes)
        .$syncOriginal();
      instance.pivotParent = parent;
      instance._exists     = exists;
      return instance;
    }

    /*Create a new pivot model from raw values returned from a query.*/
    public static fromRawAttributes(parent: Model, attributes: any[], table: string,
                                    exists = false) {
      const instance: Model & Pivot = this.fromAttributes(parent, [], table, exists);
      instance._timestamps          = instance.$hasTimestampAttributes(attributes);
      instance.$setRawAttributes(attributes, exists);
      return instance;
    }

    /*Set the keys for a select query.*/
    _setKeysForSelectQuery(this: Model & _Self, query: FedacoBuilder): FedacoBuilder {
      if (this._attributes[this.$getKeyName()] !== undefined) {
        return super._setKeysForSelectQuery(query);
      }
      query.where(this._foreignKey,
        this.$getOriginal(this._foreignKey, this.$getAttribute(this._foreignKey)));
      return query.where(this._relatedKey,
        this.$getOriginal(this._relatedKey, this.$getAttribute(this._relatedKey)));
    }

    /*Set the keys for a save update query.*/
    _setKeysForSaveQuery(this: Model & _Self, query: FedacoBuilder): FedacoBuilder {
      return this._setKeysForSelectQuery(query);
    }

    /*Get the query builder for a delete operation on the pivot.*/
    _getDeleteQuery(this: Model & _Self): FedacoBuilder {
      return this.$newQueryWithoutRelationships().where({
        [this._foreignKey]: this.$getOriginal(this._foreignKey, this.$getAttribute(this._foreignKey)),
        [this._relatedKey]: this.$getOriginal(this._relatedKey, this.$getAttribute(this._relatedKey)),
      });
    }

    /*Delete the pivot model record from the database.*/
    public async $delete(this: Model & _Self): Promise<number | boolean> {
      if (this._attributes[this.$getKeyName()] !== undefined) {
        return /*cast type int*/ super.delete();
      }
      if (this._fireModelEvent('deleting') === false) {
        return 0;
      }
      await this.$touchOwners();
      return tap(() => {
        this._exists = false;
        this._fireModelEvent('deleted', false);
      }, await this._getDeleteQuery().delete());
    }

    /*Get the table associated with the model.*/
    public $getTable(this: Model & _Self): string {
      if (isBlank(this._table)) {
        // todo fixme
        // this.setTable(str_replace('\\', '', Str.snake(Str.singular(class_basename(this)))));
        const metas                 = reflector.annotations(this.constructor);
        const meta: TableAnnotation = findLast((it) => {
          return Table.isTypeOf(it);
        }, metas);
        if (meta) {
          return singular(meta.tableName);
        } else if (this.constructor === Pivot) {
          return 'pivot';
        } else {
          throw new Error('must define table in annotation or `_table` property');
        }
      }
      return this._table;
    }

    public $setTable(table: string) {
      this._table = table;
      return this;
    }

    /*Get the foreign key column name.*/
    public $getForeignKey(): string {
      return this._foreignKey;
    }

    /*Get the "related key" column name.*/
    public $getRelatedKey(): string {
      return this._relatedKey;
    }

    /*Get the "related key" column name.*/
    public $getOtherKey(): string {
      return this.$getRelatedKey();
    }

    /*Set the key names for the pivot model instance.*/
    public $setPivotKeys(this: Model & _Self & Pivot, foreignKey: string, relatedKey: string): this {
      this._foreignKey = foreignKey;
      this._relatedKey = relatedKey;
      return this as unknown as this;
    }

    /*Determine if the pivot model or given attributes has timestamp attributes.*/
    public $hasTimestampAttributes(this: Model & _Self & Pivot, attributes: any[] | null = null): boolean {
      return this.$getCreatedAtColumn() in (attributes ?? this._attributes);
    }

    /*Get the name of the "created at" column.*/
    public $getCreatedAtColumn(this: Model & _Self & Pivot): string {
      return this.pivotParent ?
        this.pivotParent.$getCreatedAtColumn() :
        super.$getCreatedAtColumn();
    }

    /*Get the name of the "updated at" column.*/
    public $getUpdatedAtColumn(this: Model & _Self & Pivot) {
      return this.pivotParent ?
        this.pivotParent.$getUpdatedAtColumn() :
        super.$getUpdatedAtColumn();
    }

    /*Get the queueable identity for the entity.*/
    public $getQueueableId(this: Model & _Self & Pivot) {
      if (this._attributes[this.$getKeyName()] !== undefined) {
        return this.$getKey();
      }
      return `${this._foreignKey}:${this.$getAttribute(
        this._foreignKey)}:${this._relatedKey}:${this.$getAttribute(this._relatedKey)}`;
    }

    /*Get a new query to restore one or more models by their queueable IDs.*/
    public $newQueryForRestoration(this: Model & _Self & Pivot,
                                   ids: number[] | string[] | string): FedacoBuilder {
      if (isArray(ids)) {
        return this._newQueryForCollectionRestoration(ids as any[]);
      }
      if (!ids.includes(':')) {
        return super.newQueryForRestoration(ids);
      }
      const segments = ids.split(':');
      return this.$newQueryWithoutScopes().where(segments[0], segments[1]).where(segments[2],
        segments[3]);
    }

    /*Get a new query to restore multiple models by their queueable IDs.*/
    _newQueryForCollectionRestoration(this: Model & _Self & Pivot,
                                      ids: number[] | string[]): FedacoBuilder {
      if (!(`${ids[0]}`).includes(':')) {
        return super.$newQueryForRestoration(ids);
      }
      const query = this.$newQueryWithoutScopes();
      for (const id of ids as string[]) {
        const segments = id.split(':');
        query.orWhere((q: QueryBuilder) => {
          return q.where(segments[0], segments[1]).where(segments[2], segments[3]);
        });
      }
      return query;
    }

    /*Unset all the loaded relations for the instance.*/
    public $unsetRelations(this: Model & _Self & Pivot): this {
      this.pivotParent = null;
      this._relations  = {};
      // @ts-ignore
      return this;
    }
  };
}
