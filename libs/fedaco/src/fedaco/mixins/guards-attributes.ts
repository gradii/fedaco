/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { reflector } from '@gradii/annotation';
import { isArray, isPromise } from '@gradii/check-type';
import { findLast } from 'ramda';
import type { ColumnAnnotation} from '../../annotation/column';
import { FedacoColumn } from '../../annotation/column';
import type { Constructor } from '../../helper/constructor';

function isAnyGuarded(guarded: string[]) {
  return guarded.length === 1 && guarded[0] === '*';
}

// tslint:disable-next-line:no-namespace eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace GuardsAttributes {
  /*Indicates if all mass assignment is enabled.*/
  export const _unguarded = false;
  /*The actual columns that exist on the database and can be guarded.*/
  export const _guardableColumns: any[];

  /*Disable all mass assignable restrictions.*/
  export function unguard(state: boolean): void;

  /*Enable the mass assignment restrictions.*/
  export function reguard(): void;

  /*Determine if the current state is "unguarded".*/
  export function isUnguarded(): boolean;

  /*Run the given callable while being unguarded.*/
  export function unguarded(callback: Function): any;
}

export interface GuardsAttributes {
  /*The attributes that are mass assignable.*/
  _fillable: string[];
  /*The attributes that aren't mass assignable.*/
  _guarded: string[];

  getFillable(): this;

  totallyGuarded(): boolean;

  isFillable(key: string): boolean;

  getGuarded(): this;

  guard(guarded: any[]): this;

  mergeGuarded(guarded: any[]): this;

  _fillableFromArray(attributes: any): this;
}


export type GuardsAttributesCtor<M> = Constructor<GuardsAttributes>;


export function mixinGuardsAttributes<T extends Constructor<any>, M>(base: T): GuardsAttributesCtor<M> & T {
  return class _Self extends base {
    /*The attributes that are mass assignable.*/
    _fillable: string[] = [];
    /*The attributes that aren't mass assignable.*/
    _guarded: string[] = ['*'];
    /*Indicates if all mass assignment is enabled.*/
    static _unguarded = false;
    /*The actual columns that exist on the database and can be guarded.*/
    static _guardableColumns: any[];

    /*Get the fillable attributes for the model.*/
    public getFillable() {
      return this._fillable;
    }

    /*Set the fillable attributes for the model.*/
    public fillable(fillable: any[]) {
      this._fillable = fillable;
      return this;
    }

    /*Merge new fillable attributes with existing fillable attributes on the model.*/
    public mergeFillable(fillable: any[]) {
      this._fillable = [...this._fillable, ...fillable];
      return this;
    }

    /*Get the guarded attributes for the model.*/
    public getGuarded() {
      return this._guarded;
    }

    /*Set the guarded attributes for the model.*/
    public guard(guarded: any[]) {
      this._guarded = guarded;
      return this;
    }

    /*Merge new guarded attributes with existing guarded attributes on the model.*/
    public mergeGuarded(guarded: any[]) {
      this._guarded = [...this._guarded, ...guarded];
      return this;
    }

    /*Disable all mass assignable restrictions.*/
    public static unguard(state: boolean = true): void {
      this._unguarded = state;
    }

    /*Enable the mass assignment restrictions.*/
    public static reguard(): void {
      this._unguarded = false;
    }

    /*Determine if the current state is "unguarded".*/
    public static isUnguarded(): boolean {
      return this._unguarded;
    }

    /*Run the given callable while being unguarded.*/
    public static unguarded(callback: (...args: any[]) => Promise<any> | any): Promise<any> | any {
      if (this._unguarded) {
        return callback();
      }
      this.unguard();
      try {
        const rst = callback();
        if (isPromise(rst)) {
          return rst.finally(() => {
            this.reguard();
          });
        } else {
          return rst;
        }
      } finally {
        this.reguard();
      }
    }

    /*Determine if the given attribute may be mass assigned.*/
    public isFillable(key: string) {
      if ((this.constructor as typeof _Self)._unguarded) {
        return true;
      }
      if (this.getFillable().includes(key)) {
        return true;
      }
      if (this.isGuarded(key)) {
        return false;
      }
      return !this.getFillable().length &&
        !key.includes('.') &&
        !key.startsWith('_');
    }

    /*Determine if the given key is guarded.*/
    public isGuarded(key: string) {
      if (!this.getGuarded().length) {
        return false;
      }
      return isAnyGuarded(this.getGuarded()) ||
        this.getGuarded().includes(key) ||
        !this._isGuardableColumn(key);
    }

    /*Determine if the given column is a valid, guardable column.*/
    _isGuardableColumn(key: string) {
      if (this._guardableColumns == undefined) {
        // this._guardableColumns = this.getConnection().getSchemaBuilder().getColumnListing(this.getTable());
        this._guardableColumns = [];
        const meta             = reflector.propMetadata(this.constructor);
        for (const x of Object.keys(meta)) {
          if (meta[x] && isArray(meta[x])) {
            const currentMeta = findLast(it => {
              return FedacoColumn.isTypeOf(it);
            }, meta[x]) as ColumnAnnotation;

            if (currentMeta) {
              this._guardableColumns.push(x);
            }
          }
        }
      }
      return this._guardableColumns.includes(key);
    }

    /*Determine if the model is totally guarded.*/
    public totallyGuarded() {
      return this.getFillable().length === 0 && isAnyGuarded(this.getGuarded());
    }

    /*Get the fillable attributes of a given array.*/
    _fillableFromArray(attributes: any) {
      if (this.getFillable().length > 0 && !(this.constructor as typeof _Self)._unguarded) {
        const rst: any = {}, fillable = this.getFillable();
        for (const key of Object.keys(attributes)) {
          if (fillable.includes(key)) {
            rst[key] = attributes[key];
          }
        }
        return rst;
      }
      return attributes;
    }
  };
}
