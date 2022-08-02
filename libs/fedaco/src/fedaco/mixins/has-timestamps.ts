/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/check-type';
import { getUnixTime } from 'date-fns';
import type { Constructor } from '../../helper/constructor';
import type { Model } from '../model';

export interface HasTimestamps {

  /**
   * Indicates if the model should be timestamped.
   * @deprecated disable timestamps
   */
  _timestamps: boolean;

  /*Update the model's update timestamp.*/
  touch(attribute?: string): Promise<boolean>;

  /*Update the creation and update timestamps.*/
  updateTimestamps(): boolean;

  /*Set the value of the "created at" attribute.*/
  setCreatedAt(value: any): this;

  /*Set the value of the "updated at" attribute.*/
  setUpdatedAt(value: any): this;

  /*Get a fresh timestamp for the model.*/
  freshTimestamp(): Date;

  /*Get a fresh timestamp for the model.*/
  freshTimestampString(): string;

  /*Determine if the model uses timestamps.*/
  usesTimestamps(): boolean;

  /*Get the name of the "created at" column.*/
  getCreatedAtColumn(): string;

  /*Get the name of the "updated at" column.*/
  getUpdatedAtColumn(): string;

  /*Get the fully qualified "created at" column.*/
  getQualifiedCreatedAtColumn(this: Model & this): string;

  /*Get the fully qualified "updated at" column.*/
  getQualifiedUpdatedAtColumn(this: Model & this): string;
}


export type HasTimestampsCtor = Constructor<HasTimestamps>;


/** Mixin to augment a directive with a `disableRipple` property. */
export function mixinHasTimestamps<T extends Constructor<any>>(base: T): HasTimestampsCtor & T {
  // @ts-ignore
  return class _Self extends base {

    /*Indicates if the model should be timestamped.*/
    public _timestamps = true;

    /*Update the model's update timestamp.*/
    public async touch(this: Model & _Self, attribute: string = null): Promise<boolean> {
      if (attribute) {
        // @ts-ignore
        this[attribute] = this.freshTimestamp();
        return this.save();
      }
      if (!this.usesTimestamps()) {
        return false;
      }
      this.updateTimestamps();
      return this.save();
    }

    /*Update the creation and update timestamps.*/
    public updateTimestamps(this: Model & _Self): void {
      const time            = this.freshTimestamp();
      const createdAtColumn = this.getCreatedAtColumn();
      if (!this._exists && !isBlank(createdAtColumn) && !this.isDirty(createdAtColumn)) {
        this.setCreatedAt(time);
      }

      const updatedAtColumn = this.getUpdatedAtColumn();
      if (!isBlank(updatedAtColumn) && !this.isDirty(updatedAtColumn)) {
        this.setUpdatedAt(time);
      }
    }

    /*Set the value of the "created at" attribute.*/
    public setCreatedAt(value: any): this {
      this[this.getCreatedAtColumn()] = value;
      return this;
    }

    /*Set the value of the "updated at" attribute.*/
    public setUpdatedAt(value: any): this {
      this[this.getUpdatedAtColumn()] = value;
      return this;
    }

    /*Get a fresh timestamp for the model.*/
    public freshTimestamp(): number {
      return getUnixTime(new Date());
    }

    /*Get a fresh timestamp for the model.*/
    public freshTimestampString(this: Model & this) {
      return this.fromDateTime(this.freshTimestamp());
    }

    /*Determine if the model uses timestamps.*/
    public usesTimestamps(): boolean {
      return this._timestamps;
    }

    /*Get the name of the "created at" column.*/
    public getCreatedAtColumn() {
      return 'CREATED_AT' in (this.constructor as any) ?
        (this.constructor as any).CREATED_AT : 'created_at';
    }

    /*Get the name of the "updated at" column.*/
    public getUpdatedAtColumn() {
      return 'UPDATED_AT' in (this.constructor as any) ?
        (this.constructor as any).UPDATED_AT : 'updated_at';
    }

    /*Get the fully qualified "created at" column.*/
    public getQualifiedCreatedAtColumn(this: Model & this) {
      return this.qualifyColumn(this.getCreatedAtColumn());
    }

    /*Get the fully qualified "updated at" column.*/
    public getQualifiedUpdatedAtColumn(this: Model & this) {
      return this.qualifyColumn(this.getUpdatedAtColumn());
    }
  };
}
