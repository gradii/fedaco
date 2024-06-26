/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray, isBlank, isNumber, isString } from '@gradii/nanofn';
import { difference, intersection, pluck } from 'ramda';
import type { Collection } from '../../../define/collection';
import { mapWithKeys, wrap } from '../../../helper/arr';
import type { Constructor } from '../../../helper/constructor';
import type { QueryBuilder } from '../../../query-builder/query-builder';
import { BaseModel } from '../../base-model';
import type { Model } from '../../model';
import { newPivot } from '../../model-helper-global';
import type { BelongsToMany } from '../belongs-to-many';
import type { Pivot } from '../pivot';
import type { AsPivot } from './as-pivot';

export interface InteractsWithPivotTable {
  /**
   * Toggles a model (or models) from the parent.
   * Each existing model is detached, and non existing ones are attached.
   */
  toggle(ids: any, touch?: boolean): Promise<{
    attached: any[],
    detached: any[]
  }>;

  /*Sync the intermediate tables with a list of IDs without detaching.*/
  syncWithoutDetaching(ids: Collection | Model | any[]): Promise<PivotTableData>;

  /*Sync the intermediate tables with a list of IDs or collection of models.*/
  sync(ids: Collection | Model | any[], detaching?: boolean): Promise<PivotTableData>;

  /*Sync the intermediate tables with a list of IDs or collection of models with the given pivot values.*/
  syncWithPivotValues(ids: Collection | Model | any[], values: any[],
                      detaching?: boolean): Promise<Record<string, any>>;

  /*Format the sync / toggle record list so that it is keyed by ID.*/
  _formatRecordsList(records: any[]): Record<string, any>;

  /*Attach all of the records that aren't in the given current records.*/
  _attachNew(records: any[], current: any[], touch?: boolean): Promise<PivotTableData>;

  /*Update an existing pivot record on the table.*/
  updateExistingPivot(id: any, attributes: any[], touch?: boolean): Promise<any>;

  /*Update an existing pivot record on the table via a custom class.*/
  _updateExistingPivotUsingCustomClass(id: any, attributes: any[], touch: boolean): Promise<any>;

  /*Attach a model to the parent.*/
  attach(id: any, attributes?: any, touch?: boolean): Promise<void>;

  /*Attach a model to the parent using a custom class.*/
  _attachUsingCustomClass(id: any, attributes: any[]): Promise<void>;

  /*Create an array of records to insert into the pivot table.*/
  _formatAttachRecords(ids: any[], attributes: any[]): any[];

  /*Create a full attachment record payload.*/
  _formatAttachRecord(key: number, value: any, attributes: any[],
                      hasTimestamps: boolean): Record<string, any>;

  /*Get the attach record ID and extra attributes.*/
  _extractAttachIdAndAttributes(key: any, value: any, attributes: any[]): [string, any];

  /*Create a new pivot attachment record.*/
  _baseAttachRecord(id: string | number, timed: boolean): Record<string, any>;

  /*Set the creation and update timestamps on an attach record.*/
  _addTimestampsToAttachment(record: any[], exists?: boolean): Record<string, any>;

  /*Determine whether the given column is defined as a pivot column.*/
  hasPivotColumn(column: string): boolean;

  /*Detach models from the relationship.*/
  detach(ids?: any, touch?: boolean): Promise<any>;

  /*Detach models from the relationship using a custom class.*/
  _detachUsingCustomClass(ids: any): Promise<number>;

  /*Get the pivot models that are currently attached.*/
  _getCurrentlyAttachedPivots(): Promise<any[]>;

  /*Create a new pivot model instance.*/
  newPivot(attributes?: any[], exists?: boolean): AsPivot | Pivot;

  /*Create a new existing pivot model instance.*/
  newExistingPivot(attributes?: any[]): AsPivot | Pivot;

  /*Get a new plain query builder for the pivot table.*/
  newPivotStatement(): QueryBuilder;

  /*Get a new pivot statement for a given "other" ID.*/
  newPivotStatementForId(id: any): QueryBuilder;

  /*Create a new query builder for the pivot table.*/
  newPivotQuery(): QueryBuilder;

  /*Set the columns on the pivot table to retrieve.*/
  withPivot(columns: any[] | any, ...cols: any[]): this;

  /*Get all of the IDs from the given mixed value.*/
  _parseIds(value: any): any[];

  /*Get the ID from the given mixed value.*/
  _parseId(value: any): any;

  /*Cast the given keys to integers if they are numeric and string otherwise.*/
  _castKeys(keys: any[]): any[];

  /*Cast the given key to convert to primary key type.*/
  _castKey(key: any): any;

  /*Cast the given pivot attributes.*/
  _castAttributes(attributes: any[]): Model | Record<string, any>;

  /*Converts a given value to a given type value.*/
  _getTypeSwapValue(type: string, value: any): string | number;
}

type InteractsWithPivotTableCtor = Constructor<InteractsWithPivotTable>;

type PivotTableData = {
  attached: any[],
  detached: any[],
  updated?: any[],
};

export function mixinInteractsWithPivotTable<T extends Constructor<any>>(base: T): InteractsWithPivotTableCtor & T {

  return class _Self extends base {
    /*
    * Toggles a model (or models) from the parent.
    * Each existing model is detached, and non existing ones are attached.
    */
    public async toggle(this: BelongsToMany & _Self, ids: any,
                        touch = true): Promise<PivotTableData> {
      const changes: any = {
        attached: [],
        detached: []
      };
      const records      = this._formatRecordsList(this._parseIds(ids));
      const detach       = Object.values(
        intersection(
          (await this.newPivotQuery().pluck(this.relatedPivotKey)) as any[],
          Object.keys(records)
        )
      );
      if (detach.length > 0) {
        await this.detach(detach, false);
        changes['detached'] = this.castKeys(detach);
      }
      const attach = difference(Object.keys(records), detach);
      if (attach.length > 0) {
        await this.attach(attach, [], false);
        changes['attached'] = Object.keys(attach);
      }
      if (touch && (
        changes['attached'].length ||
        changes['detached'].length
      )
      ) {
        await this.touchIfTouching();
      }
      return changes;
    }

    /*Sync the intermediate tables with a list of IDs without detaching.*/
    public syncWithoutDetaching(this: BelongsToMany & _Self,
                                ids: Collection | Model | any[]): Promise<PivotTableData> {
      return this.sync(ids, false);
    }

    /*Sync the intermediate tables with a list of IDs or collection of models.*/
    public async sync(this: BelongsToMany & _Self, ids: Collection | Model | any[] | any,
                      detaching = true): Promise<PivotTableData> {
      let changes: any = {
        attached: [],
        detached: [],
        updated : []
      };
      const current    = pluck(this.relatedPivotKey, (await this._getCurrentlyAttachedPivots()));
      const records    = this._formatRecordsList(this._parseIds(ids));
      const detach     = difference(current, Object.keys(records));
      if (detaching && detach.length > 0) {
        await this.detach(detach);
        changes['detached'] = this._castKeys(detach);
      }
      changes = {...changes, ...(await this._attachNew(records, current, false))};
      if (changes['attached'].length || changes['updated'].length || changes['detached'].length) {
        await this.touchIfTouching();
      }
      return changes;
    }

    /*Sync the intermediate tables with a list of IDs or collection of models with the given pivot values.*/
    public async syncWithPivotValues(this: BelongsToMany & _Self, ids: Model | Model[],
                                     values: any[],
                                     detaching = true): Promise<PivotTableData> {
      return this.sync(
        mapWithKeys(this._parseIds(ids), id => {
          return {[id]: values};
        }), detaching);
    }

    /*Format the sync / toggle record list so that it is keyed by ID.*/
    _formatRecordsList(this: BelongsToMany & _Self, records: any[]): Record<string, any> {
      return mapWithKeys(records, (attributes, id) => {
        if (isString(attributes) || isNumber(attributes)) {
          return {[attributes]: []};
        }
        return {[id]: attributes};
      });
    }

    /*Attach all of the records that aren't in the given current records.*/
    async _attachNew(this: BelongsToMany & _Self,
               records: Record<string, any>,
               current: any[], touch = true): Promise<PivotTableData> {
      const changes: any = {
        attached: [],
        updated : []
      };
      for (const [id, attributes] of Object.entries(records)) {
        if (!current.includes(id)) {
          await this.attach(id, attributes, touch);
          changes['attached'].push(this._castKey(id));
        } else if (attributes.length > 0 && await this.updateExistingPivot(id, attributes, touch)) {
          changes['updated'].push(this._castKey(id));
        }
      }
      return changes;
    }

    /*Update an existing pivot record on the table.*/
    public async updateExistingPivot(this: BelongsToMany & _Self, id: any, attributes: any,
                                     touch = true): Promise<any> {
      if (this._using &&
        !this._pivotWheres.length &&
        !this._pivotWhereIns.length &&
        !this._pivotWhereNulls.length
      ) {
        return this._updateExistingPivotUsingCustomClass(id, attributes, touch);
      }
      if (this._pivotColumns.includes(this.updatedAt())) {
        attributes = this._addTimestampsToAttachment(attributes, true);
      }
      const updated = await this.newPivotStatementForId(this._parseId(id)).update(
        this._castAttributes(attributes));
      if (touch) {
        await this.touchIfTouching();
      }
      return updated;
    }

    /*Update an existing pivot record on the table via a custom class.*/
    async _updateExistingPivotUsingCustomClass(this: BelongsToMany & _Self, id: any,
                                               attributes: any,
                                               touch: boolean): Promise<any> {
      const pivot   = (await this._getCurrentlyAttachedPivots())
        .filter((item) => item[this._foreignPivotKey] == this._parent.GetAttribute(this._parentKey))
        .filter((item) => item[this._relatedPivotKey] == this._parseId(id))
        .pop();
      const updated = pivot ? pivot.fill(attributes).isDirty() : false;
      if (updated) {
        await pivot.save();
      }
      if (touch) {
        await this.touchIfTouching();
      }
      return /*cast type int*/ updated;
    }

    /*Attach a model to the parent.*/
    public async attach(this: BelongsToMany & _Self,
                        id: any,
                        attributes: any = {},
                        touch           = true): Promise<void> {
      if (this._using) {
        await this._attachUsingCustomClass(id, attributes);
      } else {
        await this.newPivotStatement().insert(
          this._formatAttachRecords(this._parseIds(id), attributes));
      }
      if (touch) {
        await this.touchIfTouching();
      }
    }

    /*Attach a model to the parent using a custom class.*/
    async _attachUsingCustomClass(this: BelongsToMany & _Self, id: any,
                                  attributes: any[]): Promise<void> {
      const records = this._formatAttachRecords(this._parseIds(id), attributes);
      for (const record of records) {
        await this.newPivot(record, false).Save();
      }
    }

    /*Create an array of records to insert into the pivot table.*/
    _formatAttachRecords(this: BelongsToMany & _Self, ids: any[], attributes: any[]): any[] {
      const records       = [];
      const hasTimestamps = this.hasPivotColumn(this.createdAt()) || this.hasPivotColumn(
        this.updatedAt());
      for (const [key, value] of Object.entries(ids)) {
        records.push(this._formatAttachRecord(key, value, attributes, hasTimestamps));
      }
      return records;
    }

    /*Create a full attachment record payload.*/
    _formatAttachRecord(this: BelongsToMany & _Self, key: number | string, value: any,
                        attributes: any,
                        hasTimestamps: boolean): Record<string, any> {
      let id;
      [id, attributes] = this._extractAttachIdAndAttributes(key, value, attributes);
      return {...this._baseAttachRecord(id, hasTimestamps), ...this._castAttributes(attributes)};
    }

    /*Get the attach record ID and extra attributes.*/
    _extractAttachIdAndAttributes(this: BelongsToMany & _Self, key: any, value: any,
                                  attributes: any): [string | number, any] {
      return isArray(value) ? [key, {...value, ...attributes}] : [value, attributes];
    }

    /*Create a new pivot attachment record.*/
    _baseAttachRecord(this: BelongsToMany & _Self, id: number,
                      timed: boolean): Record<string, any> {
      let record: Record<string, any> = {};
      record[this._relatedPivotKey]   = id;
      record[this._foreignPivotKey]   = this._parent.GetAttribute(this._parentKey);
      if (timed) {
        record = this._addTimestampsToAttachment(record);
      }
      for (const value of this._pivotValues) {
        record[value['column']] = value['value'];
      }
      return record;
    }

    /*Set the creation and update timestamps on an attach record.*/
    _addTimestampsToAttachment(this: BelongsToMany & _Self, record: Record<any, any>,
                               exists = false): Record<string, any> {
      let fresh = this.parent.freshTimestamp();
      if (this._using) {
        // @ts-ignore
        const pivotModel = new this._using();
        fresh            = fresh.format(pivotModel.getDateFormat());
      }
      if (!exists && this.hasPivotColumn(this.createdAt())) {
        record[this.createdAt()] = fresh;
      }
      if (this.hasPivotColumn(this.updatedAt())) {
        record[this.updatedAt()] = fresh;
      }
      return record;
    }

    /*Determine whether the given column is defined as a pivot column.*/
    public hasPivotColumn(this: BelongsToMany & _Self, column: string): boolean {
      return this._pivotColumns.includes(column);
    }

    /*Detach models from the relationship.*/
    public async detach(this: BelongsToMany & _Self, ids: any = null, touch = true): Promise<any> {
      let results;
      if (this._using && ids.length &&
        !this._pivotWheres.length &&
        !this._pivotWhereIns.length &&
        !this._pivotWhereNulls.length
      ) {
        results = this._detachUsingCustomClass(ids);
      } else {
        const query = this.newPivotQuery();
        if (!isBlank(ids)) {
          ids = this._parseIds(ids);
          if (!ids.length) {
            return 0;
          }
          query.whereIn(this.getQualifiedRelatedPivotKeyName(), /*cast type array*/ ids);
        }
        results = await query.delete();
      }
      if (touch) {
        await this.touchIfTouching();
      }
      return results;
    }

    /*Detach models from the relationship using a custom class.*/
    async _detachUsingCustomClass(this: BelongsToMany & _Self, ids: any): Promise<number> {
      let results = 0;
      for (const id of this._parseIds(ids)) {
        results += await this.newPivot({
          [this._foreignPivotKey]: this._parent.GetAttribute(this._parentKey),
          [this._relatedPivotKey]: id,
        }, true).delete();
      }
      return results;
    }

    /*Get the pivot models that are currently attached.*/
    async _getCurrentlyAttachedPivots(this: BelongsToMany & _Self): Promise<any[]> {
      return (await this.newPivotQuery().get()).map((record: any) => {
        const clazz = this._using; // todo recovery me || Pivot;
        const pivot = clazz.fromRawAttributes(this.parent, /*cast type array*/ record,
          this.getTable(), true);
        return pivot.setPivotKeys(this.foreignPivotKey, this.relatedPivotKey);
      });
    }

    /*Create a new pivot model instance.*/
    public newPivot(this: BelongsToMany & _Self,
                    attributes: Record<string, any> = {},
                    exists                          = false) {
      const pivot = newPivot(this._parent, attributes, this._table, exists, this._using);
      return pivot.SetPivotKeys(this._foreignPivotKey, this._relatedPivotKey);
    }

    /*Create a new existing pivot model instance.*/
    public newExistingPivot(this: BelongsToMany & _Self, attributes: any[] = []) {
      return this.newPivot(attributes, true);
    }

    /*Get a new plain query builder for the pivot table.*/
    public newPivotStatement(this: BelongsToMany & _Self): QueryBuilder {
      return this._query.getQuery().newQuery().from(this._table);
    }

    /*Get a new pivot statement for a given "other" ID.*/
    public newPivotStatementForId(this: BelongsToMany & _Self, id: any): QueryBuilder {
      return this.newPivotQuery().whereIn(this._relatedPivotKey, this._parseIds(id));
    }

    /*Create a new query builder for the pivot table.*/
    public newPivotQuery(this: BelongsToMany & _Self): QueryBuilder {
      const query = this.newPivotStatement();
      for (const args of this._pivotWheres) {
        // @ts-ignore
        query.where(...args);
      }
      for (const args of this._pivotWhereIns) {
        // @ts-ignore
        query.whereIn(...args);
      }
      for (const args of this._pivotWhereNulls) {
        // @ts-ignore
        query.whereNull(...args);
      }
      return query.where(this.getQualifiedForeignPivotKeyName(),
        this._parent.GetAttribute(this._parentKey));
    }

    /*Set the columns on the pivot table to retrieve.*/
    public withPivot(this: /*BelongsToMany*/ any & this, columns: any[] | any,
                     ...cols: any[]): this {
      this._pivotColumns = [
        ...this._pivotColumns, ...(isArray(columns) ? columns : arguments)
      ];
      return this;
    }

    /*Get all of the IDs from the given mixed value.*/
    _parseIds(this: BelongsToMany & _Self, value: any | any[]): any[] {
      if (value as Model instanceof BaseModel) {
        return [value.GetAttribute(this._relatedKey)];
      }
      if (isArray(value) && value.length && value[0] instanceof BaseModel) {
        return value.map(it => it.getAttribute(this._relatedKey));
      }
      // if (value instanceof Collection) {
      //   return value.pluck(this.relatedKey).all();
      // }
      // if (value instanceof BaseCollection) {
      //   return value.toArray();
      // }
      return /*cast type array*/ wrap(value);
    }

    /*Get the ID from the given mixed value.*/
    _parseId(this: BelongsToMany & _Self, value: any): any {
      return value as Model instanceof BaseModel ? value.getAttribute(this._relatedKey) : value;
    }

    /*Cast the given keys to integers if they are numeric and string otherwise.*/
    _castKeys(this: BelongsToMany & _Self, keys: any[]): any[] {
      return keys.map(v => {
        return this._castKey(v);
      });
    }

    /*Cast the given key to convert to primary key type.*/
    _castKey(this: BelongsToMany & _Self, key: any): any {
      return this._getTypeSwapValue(this._related.GetKeyType(), key);
    }

    /*Cast the given pivot attributes.*/
    _castAttributes(this: BelongsToMany & _Self, attributes: any[]): Model | Record<string, any> {
      return this._using ? this.newPivot().Fill(attributes).GetAttributes() : attributes;
    }

    /*Converts a given value to a given type value.*/
    _getTypeSwapValue(this: BelongsToMany & _Self, type: string, value: any): string | number {
      switch (type.toLowerCase()) {
        case 'int':
        case 'integer':
          return /*cast type int*/ +value;
        case 'real':
        case 'float':
        case 'double':
          return /*cast type float*/ +value;
        case 'string':
          return /*cast type string*/ `${value}`;
        default:
          return value;
      }
    }
  };
}
