/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { Encrypter } from '../encrypter';
import { Model } from '../model';
export declare namespace HasAttributes {
    const snakeAttributes: boolean;
    const encrypter: Encrypter;
}
export interface HasAttributes {
    _attributes: any;
    _original: any;
    _changes: any[];
    _classCastCache: any[];
    _dates: any[];
    _dateFormat: string;
    _appends: any[];
    attributesToArray(): any;
    attributesToArray2(): any;
    addDateAttributesToArray(attributes: any[]): any;
    addCastAttributesToArray(this: Model & this, attributes: any, mutatedAttributes: any[]): any;
    getArrayableAttributes(): any;
    getArrayableAppends(): any;
    relationsToArray(): any;
    relationsToArray2(): any;
    getArrayableRelations(): any;
    getArrayableItems(values: string[]): any;
    unsetAttribute(key: string): any;
    getAttribute<K extends Extract<keyof this, string>>(key: K | string): any | Promise<any>;
    getAttributeValue(key: string): any;
    _getAttributeFromArray(key: string): any;
    getRelationValue(this: Model & this, key: string): any;
    isRelation(key: string): any;
    getRelationshipFromMethod(this: Model & this, metadata: any, method: string): any;
    mergeCasts(casts: any): any;
    castAttribute(this: Model & this, key: string, value: any): any;
    getCastType(this: Model & this, key: string): any;
    isCustomDateTimeCast(cast: string): any;
    isImmutableCustomDateTimeCast(cast: string): any;
    isDecimalCast(cast: string): any;
    setAttribute(this: Model & this, key: string, value: any): any;
    _scopeInfo(key: string): any;
    _columnInfo(key: string): any;
    isDateAttribute(key: string): any;
    fillJsonAttribute(key: string, value: any): any;
    setClassCastableAttribute(key: string, value: any): any;
    getArrayAttributeWithValue(path: string, key: string, value: any): any;
    getArrayAttributeByKey(key: string): any;
    castAttributeAsJson(key: string, value: any): any;
    asJson(value: any): any;
    fromJson(value: string): any;
    fromFloat(value: any): any;
    asDecimal(value: number, decimals: number): any;
    asDate(value: any): any;
    asDateTime(value: any): Date;
    isStandardDateFormat(value: string): any;
    fromDateTime(value: any): any;
    asTimestamp(value: any): any;
    serializeDate(date: Date): any;
    /**
     *
     * @deprecated use @DateColumn instead
     * Get the attributes that should be converted to dates.
     */
    getDates(this: Model & this): any;
    getDateFormat(this: Model & this): any;
    setDateFormat(format: string): any;
    /**
     * @deprecated
     * Determine whether an attribute should be cast to a native type.
     */
    hasCast(this: Model & this, key: string, types?: any[] | string | null): any;
    getCasts(this: Model & this): {
        [key: string]: string;
    };
    isDateCastable(this: Model & this, key: string): any;
    isJsonCastable(this: Model & this, key: string): any;
    isEncryptedCastable(this: Model & this, key: string): any;
    isClassCastable(this: Model & this, key: string): any;
    mergeAttributesFromClassCasts(): any;
    normalizeCastClassResponse(key: string, value: any): any;
    getAttributes(): any;
    getAttributesForInsert(): any;
    setRawAttributes(attributes: any, sync?: boolean): any;
    getOriginal(key?: string | null, _default?: any): any;
    getOriginalWithoutRewindingModel(key?: string | null, _default?: any): any;
    getRawOriginal(key?: string | null, _default?: any): any;
    only(...attributes: any[]): any;
    only(attributes: any[] | any): any;
    syncOriginal(): any;
    syncOriginalAttribute(attribute: string): any;
    syncOriginalAttributes(attributes: any[] | string): any;
    syncChanges(): any;
    isDirty(...args: string[]): any;
    isDirty(attributes?: any[] | string | null): any;
    isClean(...attributes: string[] | string[][]): any;
    wasChanged(attributes?: any[] | string | null): any;
    hasChanges(changes: any[], attributes?: any[] | string | null): any;
    getDirty(): any;
    getChanges(): any;
    originalIsEquivalent(key: string): any;
    transformModelValue(this: Model & this, key: string, value: any): any;
    append(attributes: any[] | string): any;
    setAppends(appends: any[]): any;
    hasAppended(attribute: string): any;
}
declare type HasAttributesCtor = Constructor<HasAttributes>;
/** Mixin to augment a directive with a `disableRipple` property. */
export declare function mixinHasAttributes<T extends Constructor<{}>>(base: T): HasAttributesCtor & T;
export {};
