/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoDecorator } from '../../annotation/annotation.interface';
import { ColumnAnnotation } from '../../annotation/column';
import { ScopeAnnotation } from '../../annotation/scope';
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
    _changes: Record<string, any>;
    _classCastCache: any[];
    /**
    * @deprecated
    * The attributes that should be mutated to dates.
    */
    _dates: any[];
    _dateFormat: string;
    _appends: any[];
    attributesToArray(): any;
    attributesToArray2(): any;
    addDateAttributesToArray(attributes: any): any;
    addCastAttributesToArray(this: Model & this, attributes: any, mutatedAttributes: any[]): Record<string, any>;
    getArrayableAttributes(): Record<string, any>;
    getArrayableAppends(): Record<string, any>;
    relationsToArray(): Record<string, any>;
    relationsToArray2(): Record<string, any>;
    getArrayableRelations(): Record<string, any>;
    getArrayableItems(values: string[]): Record<string, any>;
    unsetAttribute(key: string): void;
    getAttribute<K extends Extract<keyof this, string>>(key: K | string): any | Promise<any>;
    getAttributeValue(key: string): any;
    _getAttributeFromArray(key: string): any | null;
    getRelationValue(this: Model & this, key: string): any | null;
    isRelation(key: string): FedacoDecorator<ColumnAnnotation> & ColumnAnnotation | undefined;
    getRelationshipFromMethod(this: Model & this, metadata: any, method: string): Promise<any | any[]>;
    mergeCasts(casts: any): this;
    castAttribute(this: Model & this, key: string, value: any): any;
    getCastType(this: Model & this, key: string): string;
    isCustomDateTimeCast(cast: string): boolean;
    isImmutableCustomDateTimeCast(cast: string): boolean;
    isDecimalCast(cast: string): boolean;
    setAttribute(this: Model & this, key: string, value: any): this;
    _scopeInfo(key: string): FedacoDecorator<ColumnAnnotation> & ScopeAnnotation;
    _columnInfo(key: string): FedacoDecorator<ColumnAnnotation> & ColumnAnnotation;
    isDateAttribute(key: string): boolean;
    fillJsonAttribute(key: string, value: any): this;
    setClassCastableAttribute(key: string, value: any): void;
    getArrayAttributeWithValue(path: string, key: string, value: any): any;
    getArrayAttributeByKey(key: string): any;
    castAttributeAsJson(key: string, value: any): string;
    asJson(value: any): string;
    fromJson(value: string): any | any[];
    fromFloat(value: any): number;
    asDecimal(value: number, decimals: number): string;
    asDate(value: any): Date;
    asDateTime(value: any): Date;
    isStandardDateFormat(value: string): boolean;
    fromDateTime(value: any): string | null;
    asTimestamp(value: any): number;
    serializeDate(date: Date): string;
    /**
     * @deprecated use @DateColumn instead
     * @breaking-change 3.0.0
     * Get the attributes that should be converted to dates.
     */
    getDates(this: Model & this): any[];
    getDateFormat(this: Model & this): string;
    setDateFormat(format: string): this;
    /**
     * @deprecated
     * @breaking-change 3.0.0
     * Determine whether an attribute should be cast to a native type.
     */
    hasCast(this: Model & this, key: string, types?: any[] | string | null): boolean;
    getCasts(this: Model & this): {
        [key: string]: string;
    };
    isDateCastable(this: Model & this, key: string): boolean;
    isJsonCastable(this: Model & this, key: string): boolean;
    isEncryptedCastable(this: Model & this, key: string): boolean;
    isClassCastable(this: Model & this, key: string): boolean;
    mergeAttributesFromClassCasts(): void;
    getAttributes(): Record<string, any>;
    getAttributesForInsert(): Record<string, any>;
    setRawAttributes(attributes: any, sync?: boolean): this;
    getOriginal(key?: string | null, _default?: any): Record<string, any>;
    getOriginalWithoutRewindingModel(key?: string | null, _default?: any): Record<string, any>;
    getRawOriginal(key?: string, _default?: any): any;
    only(...attributes: any[]): Record<string, any>;
    only(attributes: any[] | any): Record<string, any>;
    syncOriginal(): this;
    syncOriginalAttribute(attribute: string): this;
    syncOriginalAttributes(attributes: any[] | string): this;
    syncChanges(): this;
    isDirty(...args: string[]): boolean;
    isDirty(attributes?: any[] | string | null): boolean;
    isClean(...attributes: string[] | string[][]): boolean;
    wasChanged(attributes?: any[] | string | null): boolean;
    hasChanges(changes: Record<string, any>, attributes?: any[] | string): boolean;
    getDirty(): Record<string, any>;
    getChanges(): Record<string, any>;
    originalIsEquivalent(key: string): boolean;
    transformModelValue(this: Model & this, key: string, value: any): any;
    append(attributes: any[] | string): this;
    setAppends(appends: any[]): this;
    hasAppended(attribute: string): boolean;
}
declare type HasAttributesCtor = Constructor<HasAttributes>;
/** Mixin to augment a directive with a `disableRipple` property. */
export declare function mixinHasAttributes<T extends Constructor<{}>>(base: T): HasAttributesCtor & T;
export {};
