/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { Model } from '../model';
export interface SoftDeletes {
    initializeSoftDeletes(this: Model & this): void;
    forceDelete(this: Model & this): boolean;
    _performDeleteOnModel(this: Model & this): void;
    _runSoftDelete(this: Model & this): void;
    restore(this: Model & this): Promise<boolean>;
    trashed(): boolean;
    isForceDeleting(): boolean;
    getDeletedAtColumn(): string;
    getQualifiedDeletedAtColumn(this: Model & this): string;
}
declare type SoftDeletesCtor = Constructor<SoftDeletes>;
export declare function mixinSoftDeletes<T extends Constructor<{}>>(base: T): SoftDeletesCtor & T;
export {};
