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
  /*Initialize the soft deleting trait for an instance.*/
  $initializeSoftDeletes(this: Model & this): void;

  /*Force a hard delete on a soft deleted model.*/
  $forceDelete(this: Model & this): boolean;

  /*Perform the actual delete query on this model instance.*/
  _performDeleteOnModel(this: Model & this): void;

  /*Perform the actual delete query on this model instance.*/
  _runSoftDelete(this: Model & this): void;

  /*Restore a soft-deleted model instance.*/
  $restore(this: Model & this): Promise<boolean>;

  /*Determine if the model instance has been soft-deleted.*/
  $trashed(): boolean;

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
  /*Determine if the model is currently force deleting.*/
  $isForceDeleting(): boolean;

  /*Get the name of the "deleted at" column.*/
  $getDeletedAtColumn(): string;

  /*Get the fully qualified "deleted at" column.*/
  $getQualifiedDeletedAtColumn(this: Model & this): string;
}

type SoftDeletesCtor = Constructor<SoftDeletes>;

export function mixinSoftDeletes<T extends Constructor<{}>>(base: T): SoftDeletesCtor & T {
  // @ts-ignore
  return class _Self extends base {
    __isTypeofSoftDeletes = true;

    /*Indicates if the model is currently force deleting.*/
    _forceDeleting = false;

    static DELETED_AT: string;

    /*Boot the soft deleting trait for a model.*/
    public $boot() {
      (this.constructor as any).addGlobalScope('softDeleting', new SoftDeletingScope());
    }

    /*Initialize the soft deleting trait for an instance.*/
    public $initializeSoftDeletes(this: Model & this): void {
      if (!(this._casts[this.$getDeletedAtColumn()] !== undefined)) {
        this._casts[this.$getDeletedAtColumn()] = 'datetime';
      }
    }

    /*Force a hard delete on a soft deleted model.*/
    public async $forceDelete(this: Model & this): Promise<boolean> {
      this._forceDeleting = true;
      return tap(deleted => {
        this._forceDeleting = false;
        if (deleted) {
          this._fireModelEvent('forceDeleted', false);
        }
      }, await this.$delete() as boolean);
    }

    /*Perform the actual delete query on this model instance.*/
    async _performDeleteOnModel(this: Model & this) {
      if (this._forceDeleting) {
        this._exists = false;
        return this._setKeysForSaveQuery(this.$newModelQuery()).delete();
      }
      return this._runSoftDelete();
    }

    /*Perform the actual delete query on this model instance.*/
    _runSoftDelete(this: Model & this): void {
      const query                     = this._setKeysForSaveQuery(this.$newModelQuery());
      const time                      = this.$freshTimestamp();
      const columns                   = {
        [this.$getDeletedAtColumn()]:  this.$fromDateTime(time)
      };
      // @ts-ignore
      this[this.$getDeletedAtColumn()] = time;
      if (this._timestamps && !isBlank(this.$getUpdatedAtColumn())) {
        // @ts-ignore
        this[this.$getUpdatedAtColumn()]    = time;
        // @ts-ignore
        columns[this.$getUpdatedAtColumn()] = this.$fromDateTime(time);
      }
      query.update(columns);
      this.$syncOriginalAttributes(Object.keys(columns));
      this.$fireModelEvent('trashed', false);
    }

    /*Restore a soft-deleted model instance.*/
    public async $restore(this: Model & this): Promise<boolean> {
      if (this._fireModelEvent('restoring') === false) {
        return false;
      }
      // @ts-ignore
      this[this.$getDeletedAtColumn()] = null;
      this._exists                    = true;
      const result                    = await this.$save();
      this._fireModelEvent('restored', false);
      return result;
    }

    /*Determine if the model instance has been soft-deleted.*/
    public $trashed(): boolean {
      // @ts-ignore
      return !isBlank(this[this.$getDeletedAtColumn()]);
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

    /*Determine if the model is currently force deleting.*/
    public $isForceDeleting(): boolean {
      return this._forceDeleting;
    }

    /*Get the name of the "deleted at" column.*/
    public $getDeletedAtColumn(this: Model & _Self): string {
      return (this.constructor as any).DELETED_AT || 'deleted_at';
    }

    /*Get the fully qualified "deleted at" column.*/
    public $getQualifiedDeletedAtColumn(this: Model & this): string {
      return this.$qualifyColumn(this.$getDeletedAtColumn());
    }
  };
}
