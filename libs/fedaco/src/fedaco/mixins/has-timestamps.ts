/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/nanofn';
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
  Touch(attribute?: string): Promise<boolean>;

  /*Update the creation and update timestamps.*/
  UpdateTimestamps(): boolean;

  /*Set the value of the "created at" attribute.*/
  SetCreatedAt(value: any): this;

  /*Set the value of the "updated at" attribute.*/
  SetUpdatedAt(value: any): this;

  /*Get a fresh timestamp for the model.*/
  FreshTimestamp(): Date;

  /*Get a fresh timestamp for the model.*/
  FreshTimestampString(): string;

  /*Determine if the model uses timestamps.*/
  UsesTimestamps(): boolean;

  /*Get the name of the "created at" column.*/
  GetCreatedAtColumn(): string;

  /*Get the name of the "updated at" column.*/
  GetUpdatedAtColumn(): string;

  /*Get the fully qualified "created at" column.*/
  GetQualifiedCreatedAtColumn(this: Model & this): string;

  /*Get the fully qualified "updated at" column.*/
  GetQualifiedUpdatedAtColumn(this: Model & this): string;
}


export type HasTimestampsCtor = Constructor<HasTimestamps>;


/** Mixin to augment a directive with a `disableRipple` property. */
export function mixinHasTimestamps<T extends Constructor<any>>(base: T): HasTimestampsCtor & T {
  // @ts-ignore
  return class _Self extends base {

    /*Indicates if the model should be timestamped.*/
    public _timestamps = true;

    /*Update the model's update timestamp.*/
    public async Touch(this: Model & _Self, attribute: string = null): Promise<boolean> {
      if (attribute) {
        // @ts-ignore
        this[attribute] = this.FreshTimestamp();
        return this.Save();
      }
      if (!this.UsesTimestamps()) {
        return false;
      }
      this.UpdateTimestamps();
      return this.Save();
    }

    /*Update the creation and update timestamps.*/
    public UpdateTimestamps(this: Model & _Self): void {
      const time            = this.FreshTimestamp();
      const createdAtColumn = this.GetCreatedAtColumn();
      if (!this._exists && !isBlank(createdAtColumn) && !this.IsDirty(createdAtColumn)) {
        this.SetCreatedAt(time);
      }

      const updatedAtColumn = this.GetUpdatedAtColumn();
      if (!isBlank(updatedAtColumn) && !this.IsDirty(updatedAtColumn)) {
        this.SetUpdatedAt(time);
      }
    }

    /*Set the value of the "created at" attribute.*/
    public SetCreatedAt(value: any): this {
      this[this.GetCreatedAtColumn()] = value;
      return this;
    }

    /*Set the value of the "updated at" attribute.*/
    public SetUpdatedAt(value: any): this {
      this[this.GetUpdatedAtColumn()] = value;
      return this;
    }

    /*Get a fresh timestamp for the model.*/
    public FreshTimestamp(): number {
      return getUnixTime(new Date());
    }

    /*Get a fresh timestamp for the model.*/
    public FreshTimestampString(this: Model & this) {
      return this.FromDateTime(this.FreshTimestamp());
    }

    /*Determine if the model uses timestamps.*/
    public UsesTimestamps(): boolean {
      return this._timestamps;
    }

    /*Get the name of the "created at" column.*/
    public GetCreatedAtColumn() {
      return 'CREATED_AT' in (this.constructor as any) ?
        (this.constructor as any).CREATED_AT : 'created_at';
    }

    /*Get the name of the "updated at" column.*/
    public GetUpdatedAtColumn() {
      return 'UPDATED_AT' in (this.constructor as any) ?
        (this.constructor as any).UPDATED_AT : 'updated_at';
    }

    /*Get the fully qualified "created at" column.*/
    public GetQualifiedCreatedAtColumn(this: Model & this) {
      return this.QualifyColumn(this.GetCreatedAtColumn());
    }

    /*Get the fully qualified "updated at" column.*/
    public GetQualifiedUpdatedAtColumn(this: Model & this) {
      return this.QualifyColumn(this.GetUpdatedAtColumn());
    }
  };
}
