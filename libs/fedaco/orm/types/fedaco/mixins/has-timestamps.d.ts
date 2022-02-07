/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { Model } from '../model';
export interface HasTimestamps {
    /**
     * Indicates if the model should be timestamped.
     * @deprecated disable timestamps
     */
    _timestamps: boolean;
    touch(attribute?: string): boolean;
    updateTimestamps(): boolean;
    setCreatedAt(value: any): this;
    setUpdatedAt(value: any): this;
    freshTimestamp(): Date;
    freshTimestampString(): string;
    usesTimestamps(): boolean;
    getCreatedAtColumn(): string;
    getUpdatedAtColumn(): string;
    getQualifiedCreatedAtColumn(this: Model & this): string;
    getQualifiedUpdatedAtColumn(this: Model & this): string;
}
export declare type HasTimestampsCtor = Constructor<HasTimestamps>;
/** Mixin to augment a directive with a `disableRipple` property. */
export declare function mixinHasTimestamps<T extends Constructor<any>>(base: T): HasTimestampsCtor & T;
