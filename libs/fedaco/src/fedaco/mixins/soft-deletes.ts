/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/nanofn';
import { tap } from 'ramda';
import type { Constructor } from '../../helper/constructor';
import type { Model } from '../model';
import { SoftDeletingScope } from '../scopes/soft-deleting-scope';

export interface SoftDeletes {
  /* Initialize the soft deleting trait for an instance. */
  InitializeSoftDeletes(this: Model & this): void;

  /* Force a hard delete on a soft deleted model. */
  ForceDelete(this: Model & this): Promise<boolean>;

  /* Perform the actual delete query on this model instance. */
  _performDeleteOnModel(this: Model & this): void;

  /* Perform the actual delete query on this model instance. */
  _runSoftDelete(this: Model & this): void;

  /* Restore a soft-deleted model instance. */
  Restore(this: Model & this): Promise<boolean>;

  /* Determine if the model instance has been soft-deleted. */
  Trashed(): boolean;

  // /*Register a "softDeleted" model event callback with the dispatcher.*/
  // static softDeleted(callback: Function | string) {
  //   SoftDeletes.registerModelEvent('trashed', callback);
  // }
  //
  // /*Register a "restoring" model event callback with the dispatcher.*/
  // static restoring(callback: Function | string) {
  //   SoftDeletes.registerModelEvent('restoring', callback);
  // }
  //
  // /*Register a "restored" model event callback with the dispatcher.*/
  // static restored(callback: Function | string) {
  //   SoftDeletes.registerModelEvent('restored', callback);
  // }
  //
  // /*Register a "forceDeleted" model event callback with the dispatcher.*/
  // static forceDeleted(callback: Function | string) {
  //   SoftDeletes.registerModelEvent('forceDeleted', callback);
  // }
  /* Determine if the model is currently force deleting. */
  IsForceDeleting(): boolean;

  /* Get the name of the "deleted at" column. */
  GetDeletedAtColumn(): string;

  /* Get the fully qualified "deleted at" column. */
  GetQualifiedDeletedAtColumn(this: Model & this): string;
}

type SoftDeletesCtor = Constructor<SoftDeletes>;

export function mixinSoftDeletes<T extends Constructor<{}>>(base: T): SoftDeletesCtor & T {
  // @ts-ignore
  return class _Self extends base {
    __isTypeofSoftDeletes = true;

    /* Indicates if the model is currently force deleting. */
    _forceDeleting = false;

    static DELETED_AT: string;

    /* Boot the soft deleting trait for a model. */
    public Boot() {
      (this.constructor as any).addGlobalScope('softDeleting', new SoftDeletingScope());
    }

    /* Initialize the soft deleting trait for an instance. */
    public InitializeSoftDeletes(this: Model & this): void {
      if (!(this._casts[this.GetDeletedAtColumn()] !== undefined)) {
        this._casts[this.GetDeletedAtColumn()] = 'datetime';
      }
    }

    /* Force a hard delete on a soft deleted model. */
    public async ForceDelete(this: Model & this): Promise<boolean> {
      this._forceDeleting = true;
      return tap(
        (deleted) => {
          this._forceDeleting = false;
          if (deleted) {
            this._fireModelEvent('forceDeleted', false);
          }
        },
        (await this.Delete()) as boolean,
      );
    }

    /* Perform the actual delete query on this model instance. */
    async _performDeleteOnModel(this: Model & this) {
      if (this._forceDeleting) {
        this._exists = false;
        return this._setKeysForSaveQuery(this.NewModelQuery()).delete();
      }
      return this._runSoftDelete();
    }

    /* Perform the actual delete query on this model instance. */
    _runSoftDelete(this: Model & this): void {
      const query = this._setKeysForSaveQuery(this.NewModelQuery());
      const time = this.FreshTimestamp();
      const columns = {
        [this.GetDeletedAtColumn()]: this.FromDateTime(time),
      };
      // @ts-ignore
      this[this.GetDeletedAtColumn()] = time;
      if (this._timestamps && !isBlank(this.GetUpdatedAtColumn())) {
        // @ts-ignore
        this[this.GetUpdatedAtColumn()] = time;
        // @ts-ignore
        columns[this.GetUpdatedAtColumn()] = this.FromDateTime(time);
      }
      query.update(columns);
      this.SyncOriginalAttributes(Object.keys(columns));
      this.FireModelEvent('trashed', false);
    }

    /* Restore a soft-deleted model instance. */
    public async Restore(this: Model & this): Promise<boolean> {
      if (this._fireModelEvent('restoring') === false) {
        return false;
      }
      // @ts-ignore
      this[this.GetDeletedAtColumn()] = null;
      this._exists = true;
      const result = await this.Save();
      this._fireModelEvent('restored', false);
      return result;
    }

    /* Determine if the model instance has been soft-deleted. */
    public Trashed(): boolean {
      // @ts-ignore
      return !isBlank(this[this.GetDeletedAtColumn()]);
    }

    // /*Register a "softDeleted" model event callback with the dispatcher.*/
    // public static softDeleted(callback: Function | string) {
    //   SoftDeletes.registerModelEvent('trashed', callback);
    // }
    //
    // /*Register a "restoring" model event callback with the dispatcher.*/
    // public static restoring(callback: Function | string) {
    //   SoftDeletes.registerModelEvent('restoring', callback);
    // }
    //
    // /*Register a "restored" model event callback with the dispatcher.*/
    // public static restored(callback: Function | string) {
    //   SoftDeletes.registerModelEvent('restored', callback);
    // }
    //
    // /*Register a "forceDeleted" model event callback with the dispatcher.*/
    // public static forceDeleted(callback: Function | string) {
    //   SoftDeletes.registerModelEvent('forceDeleted', callback);
    // }

    /* Determine if the model is currently force deleting. */
    public IsForceDeleting(): boolean {
      return this._forceDeleting;
    }

    /* Get the name of the "deleted at" column. */
    public GetDeletedAtColumn(this: Model & _Self): string {
      return (this.constructor as any).DELETED_AT || 'deleted_at';
    }

    /* Get the fully qualified "deleted at" column. */
    public GetQualifiedDeletedAtColumn(this: Model & this): string {
      return this.QualifyColumn(this.GetDeletedAtColumn());
    }
  };
}
