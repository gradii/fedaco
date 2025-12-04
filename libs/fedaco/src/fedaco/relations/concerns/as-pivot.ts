/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { reflector } from '@gradii/annotation';
import { findLast, isArray, isBlank, singular, tap } from '@gradii/nanofn';
import type { TableAnnotation } from '../../../annotation/table/table';
import { Table } from '../../../annotation/table/table';
import type { Constructor } from '../../../helper/constructor';
import type { QueryBuilder } from '../../../query-builder/query-builder';
import type { FedacoBuilder } from '../../fedaco-builder';
import type { Model } from '../../model';
import { Pivot } from '../pivot';

// tslint:disable-next-line:no-namespace
export declare namespace AsPivot {
  /* Create a new pivot model instance. */
  export function fromAttributes(parent: Model, attributes: any[], table: string, exists?: boolean): any;

  /* Create a new pivot model from raw values returned from a query. */
  export function fromRawAttributes(parent: Model, attributes: any, table: string, exists: boolean): any;
}

export interface AsPivot extends Model {
  /* The parent model of the relationship. */
  pivotParent: Model;
  /* The name of the foreign key column. */
  _foreignKey: string;
  /* The name of the "other key" column. */
  _relatedKey: string;

  /* Set the keys for a select query. */
  _setKeysForSelectQuery(query: FedacoBuilder<this>): FedacoBuilder<this>;

  /* Set the keys for a save update query. */
  _setKeysForSaveQuery(query: FedacoBuilder<this>): FedacoBuilder<this>;

  /* Delete the pivot model record from the database. */
  Delete(): Promise<number | boolean>;

  /* Get the query builder for a delete operation on the pivot. */
  _getDeleteQuery(): FedacoBuilder;

  /* Get the table associated with the model. */
  GetTable(): string;

  SetTable(tableName: string): this;

  /* Get the foreign key column name. */
  GetForeignKey(): string;

  /* Get the "related key" column name. */
  GetRelatedKey(): string;

  /* Get the "related key" column name. */
  GetOtherKey(): string;

  /* Set the key names for the pivot model instance. */
  SetPivotKeys(foreignKey: string, relatedKey: string): this;

  /* Determine if the pivot model or given attributes has timestamp attributes. */
  HasTimestampAttributes(attributes?: any[] | null): boolean;

  /* Get the name of the "created at" column. */
  GetCreatedAtColumn(): string;

  /* Get the name of the "updated at" column. */
  GetUpdatedAtColumn(): string;

  /* Get the queueable identity for the entity. */
  GetQueueableId(): number | string;

  /* Get a new query to restore one or more models by their queueable IDs. */
  NewQueryForRestoration(ids: number[] | string[] | string): FedacoBuilder<this>;

  /* Get a new query to restore multiple models by their queueable IDs. */
  _newQueryForCollectionRestoration(ids: number[] | string[]): FedacoBuilder<this>;

  /* Unset all the loaded relations for the instance. */
  UnsetRelations(): this;
}

export type AsPivotCtor = Constructor<AsPivot>;

export function mixinAsPivot<T extends Constructor<any>>(base: T): AsPivotCtor & T {
  return class _Self extends base {
    /* The parent model of the relationship. */
    public pivotParent: Model;
    /* The name of the foreign key column. */
    _foreignKey: string;
    /* The name of the "other key" column. */
    _relatedKey: string;

    /* Create a new pivot model instance. */
    public static fromAttributes(parent: Model, attributes: any[], table: string, exists = false) {
      const instance: Model & Pivot & AsPivot = new this();
      instance._timestamps = instance.HasTimestampAttributes(attributes);
      instance.SetConnection(parent.GetConnectionName()).SetTable(table).ForceFill(attributes).SyncOriginal();
      instance.pivotParent = parent;
      instance._exists = exists;
      return instance;
    }

    /* Create a new pivot model from raw values returned from a query. */
    public static fromRawAttributes(parent: Model, attributes: any[], table: string, exists = false) {
      const instance: Model & Pivot = this.fromAttributes(parent, [], table, exists);
      instance._timestamps = instance.HasTimestampAttributes(attributes);
      instance.SetRawAttributes(attributes, exists);
      return instance;
    }

    /* Set the keys for a select query. */
    _setKeysForSelectQuery(this: Model & _Self, query: FedacoBuilder): FedacoBuilder {
      if (this._attributes[this.GetKeyName()] !== undefined) {
        return super._setKeysForSelectQuery(query);
      }
      query.where(this._foreignKey, this.GetOriginal(this._foreignKey, this.GetAttribute(this._foreignKey)));
      return query.where(this._relatedKey, this.GetOriginal(this._relatedKey, this.GetAttribute(this._relatedKey)));
    }

    /* Set the keys for a save update query. */
    _setKeysForSaveQuery(this: Model & _Self, query: FedacoBuilder): FedacoBuilder {
      return this._setKeysForSelectQuery(query);
    }

    /* Get the query builder for a delete operation on the pivot. */
    _getDeleteQuery(this: Model & _Self): FedacoBuilder {
      return this.NewQueryWithoutRelationships().where({
        [this._foreignKey]: this.GetOriginal(this._foreignKey, this.GetAttribute(this._foreignKey)),
        [this._relatedKey]: this.GetOriginal(this._relatedKey, this.GetAttribute(this._relatedKey)),
      });
    }

    /* Delete the pivot model record from the database. */
    public async Delete(this: Model & _Self): Promise<number | boolean> {
      if (this._attributes[this.GetKeyName()] !== undefined) {
        return /* cast type int */ super.delete();
      }
      if (this._fireModelEvent('deleting') === false) {
        return 0;
      }
      await this.TouchOwners();
      return tap(await this._getDeleteQuery().delete(), () => {
        this._exists = false;
        this._fireModelEvent('deleted', false);
      });
    }

    /* Get the table associated with the model. */
    public GetTable(this: Model & _Self): string {
      if (isBlank(this._table)) {
        // todo fixme
        // this.setTable(str_replace('\\', '', Str.snake(Str.singular(class_basename(this)))));
        const metas = reflector.annotations(this.constructor);
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

    public SetTable(table: string) {
      this._table = table;
      return this;
    }

    /* Get the foreign key column name. */
    public GetForeignKey(): string {
      return this._foreignKey;
    }

    /* Get the "related key" column name. */
    public GetRelatedKey(): string {
      return this._relatedKey;
    }

    /* Get the "related key" column name. */
    public GetOtherKey(): string {
      return this.GetRelatedKey();
    }

    /* Set the key names for the pivot model instance. */
    public SetPivotKeys(this: Model & _Self & Pivot, foreignKey: string, relatedKey: string): this {
      this._foreignKey = foreignKey;
      this._relatedKey = relatedKey;
      return this as unknown as this;
    }

    /* Determine if the pivot model or given attributes has timestamp attributes. */
    public HasTimestampAttributes(this: Model & _Self & Pivot, attributes: any[] | null = null): boolean {
      return this.GetCreatedAtColumn() in (attributes ?? this._attributes);
    }

    /* Get the name of the "created at" column. */
    public GetCreatedAtColumn(this: Model & _Self & Pivot): string {
      return this.pivotParent ? this.pivotParent.GetCreatedAtColumn() : super.GetCreatedAtColumn();
    }

    /* Get the name of the "updated at" column. */
    public GetUpdatedAtColumn(this: Model & _Self & Pivot) {
      return this.pivotParent ? this.pivotParent.GetUpdatedAtColumn() : super.GetUpdatedAtColumn();
    }

    /* Get the queueable identity for the entity. */
    public GetQueueableId(this: Model & _Self & Pivot) {
      if (this._attributes[this.GetKeyName()] !== undefined) {
        return this.GetKey();
      }
      return `${this._foreignKey}:${this.GetAttribute(
        this._foreignKey,
      )}:${this._relatedKey}:${this.GetAttribute(this._relatedKey)}`;
    }

    /* Get a new query to restore one or more models by their queueable IDs. */
    public NewQueryForRestoration(this: Model & _Self & Pivot, ids: number[] | string[] | string): FedacoBuilder {
      if (isArray(ids)) {
        return this._newQueryForCollectionRestoration(ids as any[]);
      }
      if (!ids.includes(':')) {
        return super.newQueryForRestoration(ids);
      }
      const segments = ids.split(':');
      return this.NewQueryWithoutScopes().where(segments[0], segments[1]).where(segments[2], segments[3]);
    }

    /* Get a new query to restore multiple models by their queueable IDs. */
    _newQueryForCollectionRestoration(this: Model & _Self & Pivot, ids: number[] | string[]): FedacoBuilder {
      if (!`${ids[0]}`.includes(':')) {
        return super.NewQueryForRestoration(ids);
      }
      const query = this.NewQueryWithoutScopes();
      for (const id of ids as string[]) {
        const segments = id.split(':');
        query.orWhere((q: QueryBuilder) => {
          return q.where(segments[0], segments[1]).where(segments[2], segments[3]);
        });
      }
      return query;
    }

    /* Unset all the loaded relations for the instance. */
    public UnsetRelations(this: Model & _Self & Pivot): this {
      this.pivotParent = null;
      this._relations = {};
      // @ts-ignore
      return this;
    }
  };
}
