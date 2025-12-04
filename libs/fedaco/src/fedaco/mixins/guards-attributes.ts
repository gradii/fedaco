/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { reflector } from '@gradii/annotation';
import { findLast, isArray, isPromise } from '@gradii/nanofn';
import type { ColumnAnnotation } from '../../annotation/column';
import { FedacoColumn } from '../../annotation/column';
import type { Constructor } from '../../helper/constructor';

function isAnyGuarded(guarded: string[]) {
  return guarded.length === 1 && guarded[0] === '*';
}

export interface GuardsAttributes {
  /* The attributes that are mass assignable. */
  _fillable: string[];
  /* The attributes that aren't mass assignable. */
  _guarded: string[];

  _unFillable: string[];

  GetFillable(): string[];

  GetRealFillable(): string[];

  Fillable(fillable: string[]): this;

  MergeFillable(fillable: string[]): this;

  TotallyGuarded(): boolean;

  IsFillable(key: string): boolean;

  GetGuarded(): this;

  Guard(guarded: any[]): this;

  MergeGuarded(guarded: any[]): this;

  UnFillable(attributes: string[]): this;

  MergeUnFillable(attributes: string[]): this;

  _fillableFromArray(attributes: any): this;
}

export interface GuardsAttributesCtor<M> {
  /* Indicates if all mass assignment is enabled. */
  _unguarded: boolean;
  /* The actual columns that exist on the database and can be guarded. */
  readonly _guardableColumns: string[];

  readonly _metaFillable: string[];

  /* Disable all mass assignable restrictions. */
  unguard(state: boolean): void;

  /* Enable the mass assignment restrictions. */
  reguard(): void;

  /* Determine if the current state is "unguarded". */
  isUnguarded(): boolean;

  /* Run the given callable while being unguarded. */
  unguarded(callback: Function): any;

  new(...args: any[]): GuardsAttributes
};

export function mixinGuardsAttributes<T extends Constructor<any>, M>(base: T): GuardsAttributesCtor<M> & T {
  return class _Self extends base {
    /* The attributes that are mass assignable. */
    _fillable: string[] = [];
    /* The attributes that aren't mass assignable. */
    _guarded: string[] = ['*'];

    _unFillable: string[] = [];
    /* Indicates if all mass assignment is enabled. */
    static _unguarded = false;
    /* The actual columns that exist on the database and can be guarded. */
    static _guardableColumns: string[];

    static _metaFillable: string[];

    constructor(...args: any[]) {
      super(...args);
      this._initFillableFromAnnotations();
      this._initGuardedFromAnnotations();
    }

    /* Get the fillable attributes for the model. */
    public GetFillable() {
      return this._fillable;
    }

    public GetRealFillable() {
      const fillable = new Set((this.constructor as typeof _Self)._metaFillable);
      for (const item of this._unFillable) {
        fillable.delete(item);
      }
      for (const item of this._fillable) {
        fillable.add(item);
      }
      return Array.from(fillable);
    }

    #noDefinedFillable() {
      return this._fillable.length === 0;
    }

    #realNoFillable() {
      return this._fillable.length === 0 && (this.constructor as typeof _Self)._metaFillable.length === 0;
    }

    #checkFillable(key: string) {
      if (this._fillable.includes(key)) {
        return true;
      }
      if (this._unFillable.includes(key)) {
        return false;
      }
      return (this.constructor as typeof _Self)._metaFillable.includes(key);
    }

    // // if define guarded is not ['*']
    // #checkDefineGuarded(key: string) {
    //   if(!this.GetGuarded().length || isAnyGuarded(this.GetGuarded())) {
    //     return false;
    //   }
    //   return this.GetGuarded().includes(key)
    // }

    /* Set the fillable attributes for the model. */
    public Fillable(fillable: string[]) {
      this._fillable = fillable;
      return this;
    }

    /* Merge new fillable attributes with existing fillable attributes on the model. */
    public MergeFillable(fillable: any[]) {
      this._fillable = [...this._fillable, ...fillable];
      return this;
    }

    /* Get the guarded attributes for the model. */
    public GetGuarded() {
      return this._guarded;
    }

    /* Set the guarded attributes for the model. */
    public Guard(guarded: any[]) {
      this._guarded = guarded;
      return this;
    }

    /* Merge new guarded attributes with existing guarded attributes on the model. */
    public MergeGuarded(guarded: any[]) {
      this._guarded = [...this._guarded, ...guarded];
      return this;
    }

    public UnFillable(attributes: string[]) {
      this._unFillable = attributes;
      return this;
    }

    public MergeUnFillable(attributes: string[]) {
      this._unFillable = [...this._unFillable, ...attributes];
      return this;
    }

    /* Disable all mass assignable restrictions. */
    public static unguard(state = true): void {
      this._unguarded = state;
    }

    /* Enable the mass assignment restrictions. */
    public static reguard(): void {
      this._unguarded = false;
    }

    /* Determine if the current state is "unguarded". */
    public static isUnguarded(): boolean {
      return this._unguarded;
    }

    /* Run the given callable while being unguarded. */
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

    /* Determine if the given attribute may be mass assigned. */
    public IsFillable(key: string) {
      if ((this.constructor as typeof _Self)._unguarded) {
        return true;
      }
      if (this.#checkFillable(key)) {
        return true;
      }
      if (this.IsGuarded(key)) {
        return false;
      }
      return this.#noDefinedFillable() && !key.includes('.') && !key.startsWith('_');
    }

    /* Determine if the given key is guarded. */
    public IsGuarded(key: string) {
      if (!this.GetGuarded().length) {
        return false;
      }
      return isAnyGuarded(this.GetGuarded()) || this.GetGuarded().includes(key) || !this._isGuardableColumn(key);
    }

    /* Determine if the given column is a valid, guardable column. */
    _isGuardableColumn(key: string) {
      return (this.constructor as typeof _Self)._guardableColumns.includes(key);
    }

    /* Determine if the model is totally guarded. */
    public TotallyGuarded() {
      return this.#realNoFillable() && isAnyGuarded(this.GetGuarded());
    }

    /* Get the fillable attributes of a given array. */
    _fillableFromArray(attributes: any) {
      if (!this.#realNoFillable() && !(this.constructor as typeof _Self)._unguarded) {
        const rst: any = {};
        for (const key of Object.keys(attributes)) {
          if (this.IsFillable(key)) {
            rst[key] = attributes[key];
          }
        }
        return rst;
      }
      return attributes;
    }

    /* Initialize the fillable attributes from annotations. */
    _initFillableFromAnnotations() {
      if ((this.constructor as typeof _Self)._guardableColumns == undefined) {
        const _metaFillable: string[] = [];
        const meta = reflector.propMetadata(this.constructor);
        for (const key of Object.keys(meta)) {
          if (meta[key] && isArray(meta[key])) {
            const currentMeta = findLast((it) => {
              return FedacoColumn.isTypeOf(it);
            }, meta[key]) as ColumnAnnotation;

            if (currentMeta && currentMeta.fillable) {
              _metaFillable.push(key);
            }
          }
        }

        (this.constructor as typeof _Self)._metaFillable = _metaFillable;
      }
    }

    _initGuardedFromAnnotations() {
      if ((this.constructor as typeof _Self)._guardableColumns == undefined) {
        const _guardableColumns: string[] = [];
        const meta = reflector.propMetadata(this.constructor);
        for (const x of Object.keys(meta)) {
          if (meta[x] && isArray(meta[x])) {
            const currentMeta = findLast((it) => {
              return FedacoColumn.isTypeOf(it);
            }, meta[x]) as ColumnAnnotation;

            if (currentMeta) {
              _guardableColumns.push(x);
            }
          }
        }

        (this.constructor as typeof _Self)._guardableColumns = _guardableColumns;
      }
    }
  };
}
