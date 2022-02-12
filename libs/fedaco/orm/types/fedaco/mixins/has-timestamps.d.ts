/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { Model } from '../model';
export interface HasTimestamps {
    _timestamps: boolean;
    touch(attribute?: string): Promise<boolean>;
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

export declare function mixinHasTimestamps<T extends Constructor<any>>(
    base: T
): HasTimestampsCtor & T;
