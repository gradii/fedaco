/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { reflector } from '@gradii/annotation';
import {
  equals,
  findLast,
  isArray,
  isBlank,
  isFunction,
  isNumber,
  isObjectEmpty,
  isString,
  omit,
  pick,
  snakeCase,
  tap,
  uniq,
} from '@gradii/nanofn';
import { format, formatISO, getUnixTime, isValid, parse, startOfDay } from 'date-fns';
import Decimal from 'decimal.js';
import type { FedacoDecorator } from '../../annotation/annotation.interface';
import type { ColumnAnnotation } from '../../annotation/column';
import { FedacoColumn } from '../../annotation/column';
import { ArrayColumn } from '../../annotation/column/array.column';
import { BinaryColumn } from '../../annotation/column/binary.column';
import { BooleanColumn } from '../../annotation/column/boolean.column';
import { CurrencyColumn } from '../../annotation/column/currency.column';
import { DateColumn } from '../../annotation/column/date.column';
import { DatetimeColumn } from '../../annotation/column/datetime.column';
import { DecimalColumn } from '../../annotation/column/decimal.column';
import { FloatColumn } from '../../annotation/column/float.column';
import { IntegerColumn } from '../../annotation/column/integer.column';
import { JsonColumn } from '../../annotation/column/json.column';
import { ObjectColumn } from '../../annotation/column/object.column';
import { PrimaryGeneratedColumn } from '../../annotation/column/primary-generated.column';
import { PrimaryColumn } from '../../annotation/column/primary.column';
import { TextColumn } from '../../annotation/column/text.column';
import { TimestampColumn } from '../../annotation/column/timestamp.column';
import type { RelationColumnAnnotation } from '../../annotation/relation-column';
import { FedacoRelationColumn } from '../../annotation/relation-column';
import type { ScopeAnnotation } from '../../annotation/scope';
import { Scope } from '../../annotation/scope';
import { wrap } from '../../helper/arr';
import type { Constructor } from '../../helper/constructor';
import { get, set } from '../../helper/obj';
import { BaseModel } from '../base-model';
import type { Encrypter } from '../encrypter';
import { Crypt } from '../encrypter';
import { type Model } from '../model';
import { Relation } from '../relations/relation';

const EPSILON = 0.000001;

/* The built-in, primitive cast types supported by Fedaco. */
const PrimitiveCastTypes: string[] = [
  'array',
  'bool',
  'boolean',
  'collection',
  'custom_datetime',
  'date',
  'datetime',
  'decimal',
  'double',
  'encrypted',
  'encrypted:array',
  'encrypted:collection',
  'encrypted:json',
  'encrypted:object',
  'float',
  'immutable_date',
  'immutable_datetime',
  'immutable_custom_datetime',
  'int',
  'integer',
  'json',
  'object',
  'real',
  'string',
  'timestamp',
];

export interface HasAttributes {
  /* The model's attributes. */
  _attributes: any;
  /* The model attribute's original state. */
  _original: any;
  /* The changed model attributes. */
  _changes: Record<string, any>;
  /* The attributes that should be cast. */
  _casts: { [key: string]: string };
  /* The attributes that have been cast using custom classes. */
  _classCastCache: any[];

  /**
   * @deprecated
   * The attributes that should be mutated to dates.
   */
  _dates: any[];
  /* The storage format of the model's date columns. */
  _dateFormat: string;
  /* The accessors to append to the model's array form. */
  _appends: any[];

  AttributesToArray(): any;

  AttributesToArray2(): any;

  /* Add the date attributes to the attributes array. */
  AddDateAttributesToArray(attributes: any): any;

  // /*Add the mutated attributes to the attributes array.*/
  // addMutatedAttributesToArray(attributes: any[], mutatedAttributes: any[]) {
  //   for (let key of mutatedAttributes) {
  //     if (!array_key_exists(key, attributes)) {
  //       continue;
  //     }
  //     attributes[key] = this.mutateAttributeForArray(key, attributes[key]);
  //   }
  //   return attributes;
  // }
  /* Add the casted attributes to the attributes array. */
  AddCastAttributesToArray(this: Model & this, attributes: any, mutatedAttributes: any[]): Record<string, any>;

  /* Get an attribute array of all arrayable attributes. */
  GetArrayableAttributes(): Record<string, any>;

  /* Get all of the appendable values that are arrayable. */
  GetArrayableAppends(): Record<string, any>;

  /* Get the model's relationships in array form. */
  RelationsToArray(): Record<string, any>;

  RelationsToArray2(): Record<string, any>;

  /* Get an attribute array of all arrayable relations. */
  GetArrayableRelations(): Record<string, any>;

  /* Get an attribute array of all arrayable values. */
  GetArrayableItems(values: string[]): Record<string, any>;

  /* Unset to delete a attribute from the model. */
  UnsetAttribute(key: string): void;

  /* Get an attribute from the model. */
  GetAttribute<K extends Extract<keyof this, string>>(key: K | string): any | Promise<any>;

  /* Get a plain attribute (not a relationship). */
  GetAttributeValue(key: string): any;

  /* Get an attribute from the Attributes array. */
  _getAttributeFromArray(key: string): any | null;

  /* Get a relationship. */
  GetRelationValue(this: Model & this, key: string): any | null;

  /* Determine if the given key is a relationship method on the model. */
  IsRelation(key: string): (FedacoDecorator<ColumnAnnotation> & ColumnAnnotation) | undefined;

  // /*Handle a lazy loading violation.*/
  // handleLazyLoadingViolation(key: string) {
  //   if (HasAttributes.lazyLoadingViolationCallback !== undefined) {
  //     return call_user_func(HasAttributes.lazyLoadingViolationCallback, this, key);
  //   }
  //   throw new LazyLoadingViolationException(this, key);
  // }
  /* Get a relationship value from a method. */
  GetRelationshipFromMethod(this: Model & this, metadata: any, method: string): Promise<any | any[]>;

  // /*Determine if a get mutator exists for an attribute.*/
  // hasGetMutator(key: string) {
  //   return method_exists(this, 'get' + Str.studly(key) + 'Attribute');
  // }
  //
  // /*Get the value of an attribute using its mutator.*/
  // mutateAttribute(key: string, value: any) {
  //   return this['get' + Str.studly(key) + 'Attribute'](value);
  // }
  // /*Get the value of an attribute using its mutator for array conversion.*/
  // mutateAttributeForArray(key: string, value: any) {
  //   /*this.isClassCastable(key) ?
  //     this.getClassCastableAttributeValue(key, value) :*/
  //   return this.mutateAttribute(key, value);
  //   // return value instanceof Arrayable ? value.toArray() : value;
  // }
  /* Merge new casts with existing casts on the model. */
  MergeCasts(casts: any): this;

  /* Cast an attribute to a native PHP type. */
  CastAttribute(this: Model & this, key: string, value: any): any;

  /* Get the type of cast for a model attribute. */
  GetCastType(this: Model & this, key: string): string;

  /* Determine if the cast type is a custom date time cast. */
  IsCustomDateTimeCast(cast: string): boolean;

  /* Determine if the cast type is an immutable custom date time cast. */
  IsImmutableCustomDateTimeCast(cast: string): boolean;

  /* Determine if the cast type is a decimal cast. */
  IsDecimalCast(cast: string): boolean;

  /* Set a given attribute on the model. */
  SetAttribute(this: Model & this, key: string, value: any): this;

  _scopeInfo(key: string): FedacoDecorator<ColumnAnnotation> & ScopeAnnotation;

  _columnInfo(key: string): FedacoDecorator<ColumnAnnotation> & ColumnAnnotation;

  /* Determine if the given attribute is a date or date castable. */
  IsDateAttribute(key: string): boolean;

  /* Set a given JSON attribute on the model. */
  FillJsonAttribute(key: string, value: any): this;

  /* Set the value of a class castable attribute. */
  SetClassCastableAttribute(key: string, value: any): void;

  /* Get an array attribute with the given key and value set. */
  GetArrayAttributeWithValue(path: string, key: string, value: any): any;

  /* Get an array attribute or return an empty array if it is not set. */
  GetArrayAttributeByKey(key: string): any;

  /* Cast the given attribute to JSON. */
  CastAttributeAsJson(key: string, value: any): string;

  /* Encode the given value as JSON. */
  AsJson(value: any): string;

  /* Decode the given JSON back into an array or object. */
  FromJson(value: string): any | any[];

  /* Decode the given float. */
  FromFloat(value: any): number;

  /* Return a decimal as string. */
  AsDecimal(value: number, decimals: number): string;

  /* Return a timestamp as DateTime object with time set to 00:00:00. */
  AsDate(value: any): Date;

  /* Return a timestamp as DateTime object. */
  AsDateTime(value: any): Date;

  /* Determine if the given value is a standard date format. */
  IsStandardDateFormat(value: string): boolean;

  /* Convert a DateTime to a storable string. */
  FromDateTime(value: any): string | null;

  /* Return a timestamp as unix timestamp. */
  AsTimestamp(value: any): number;

  /* Prepare a date for array / JSON serialization. */
  SerializeDate(date: Date): string;

  /**
   * @deprecated use @DateColumn instead
   * @breaking-change 3.0.0
   * Get the attributes that should be converted to dates.
   */
  GetDates(this: Model & this): any[];

  /* Get the format for database stored dates. */
  GetDateFormat(this: Model & this): string;

  /* Set the date format used by the model. */
  SetDateFormat(format: string): this;

  /**
   * @deprecated
   * @breaking-change 3.0.0
   * Determine whether an attribute should be cast to a native type.
   */
  HasCast(this: Model & this, key: string, types?: any[] | string | null): boolean;

  /* Get the casts array. */
  GetCasts(this: Model & this): { [key: string]: string };

  /* Determine whether a value is Date / DateTime castable for inbound manipulation. */
  IsDateCastable(this: Model & this, key: string): boolean;

  /* Determine whether a value is JSON castable for inbound manipulation. */
  IsJsonCastable(this: Model & this, key: string): boolean;

  /* Determine whether a value is an encrypted castable for inbound manipulation. */
  IsEncryptedCastable(this: Model & this, key: string): boolean;

  /* Determine if the given key is cast using a custom class. */
  IsClassCastable(this: Model & this, key: string): boolean;

  /* Merge the cast class attributes back into the model. */
  MergeAttributesFromClassCasts(): void;

  /* Normalize the response from a custom class caster. */
  // normalizeCastClassResponse(key: string, value: any);

  /* Get all of the current attributes on the model. */
  GetAttributes(): Record<string, any>;

  /* Get all of the current attributes on the model for an insert operation. */
  GetAttributesForInsert(): Record<string, any>;

  /* Set the array of model attributes. No checking is done. */
  SetRawAttributes(attributes: any, sync?: boolean): this;

  /* Get the model's original attribute values. */
  GetOriginal(key?: string | null, _default?: any): Record<string, any>;

  /* Get the model's original attribute values. */
  GetOriginalWithoutRewindingModel(key?: string | null, _default?: any): Record<string, any>;

  /* Get the model's raw original attribute values. */
  GetRawOriginal(key?: string, _default?: any): any;

  /* Get a subset of the model's attributes. */
  Only(...attributes: any[]): Record<string, any>;

  Only(attributes: any[] | any): Record<string, any>;

  /* Sync the original attributes with the current. */
  SyncOriginal(): this;

  /* Sync a single original attribute with its current value. */
  SyncOriginalAttribute(attribute: string): this;

  /* Sync multiple original attribute with their current values. */
  SyncOriginalAttributes(attributes: any[] | string): this;

  /* Sync the changed attributes. */
  SyncChanges(): this;

  /* Determine if the model or any of the given attribute(s) have been modified. */
  IsDirty(...args: string[]): boolean;

  IsDirty(attributes?: any[] | string | null): boolean;

  /* Determine if the model or all the given attribute(s) have remained the same. */
  IsClean(...attributes: string[] | string[][]): boolean;

  /* Determine if the model or any of the given attribute(s) have been modified. */
  WasChanged(attributes?: any[] | string | null): boolean;

  /* Determine if any of the given attributes were changed. */
  HasChanges(changes: Record<string, any>, attributes?: any[] | string): boolean;

  /* Get the attributes that have been changed since the last sync. */
  GetDirty(): Record<string, any>;

  /* Get the attributes that were changed. */
  GetChanges(): Record<string, any>;

  /* Determine if the new and old values for a given key are equivalent. */
  OriginalIsEquivalent(key: string): boolean;

  /* Transform a raw model value using mutators, casts, etc. */
  TransformModelValue(this: Model & this, key: string, value: any): any;

  /* Append attributes to query when building a query. */
  Append(attributes: any[] | string): this;

  /* Set the accessors to append to model arrays. */
  SetAppends(appends: any[]): this;

  /* Return whether the accessor attribute has been appended. */
  HasAppended(attribute: string): boolean;
}

export interface HasAttributesCtor {
  snakeAttributes: boolean;
  encrypter: Encrypter;

  new (...args: any[]): HasAttributes;
}

/** Mixin to augment a directive with a `disableRipple` property. */
export function mixinHasAttributes<T extends Constructor<{}>>(base: T): HasAttributesCtor & T {
  // @ts-ignore
  // @ts-ignore
  return class _Self extends base {
    /* The model's attributes. */
    _attributes: any = {};
    /* The model attribute's original state. */
    _original: any = {};
    /* The changed model attributes. */
    _changes: Record<string, any> = {};
    /* The attributes that should be cast. */
    _casts: { [key: string]: string } = null;
    /* The attributes that have been cast using custom classes. */
    _classCastCache: any[] = [];

    /* The attributes that should be mutated to dates. */
    _dates: any[] = [];
    /* The storage format of the model's date columns. */
    _dateFormat: string;
    /* The accessors to append to the model's array form. */
    _appends: any[] = [];
    /* Indicates whether attributes are snake cased on arrays. */
    public static snakeAttributes = true;
    /* The cache of the mutated attributes for each class. */
    static mutatorCache: any[] = [];
    /* The encrypter instance that is used to encrypt attributes. */
    public static encrypter: Encrypter;

    /* Convert the model's attributes to an array. */

    constructor(...args: any[]) {
      super(...args);
    }

    /* Convert the model's attributes to an array. */
    public AttributesToArray(this: Model & _Self) {
      let attributes = this.GetArrayableAttributes();
      // attributes     = this.addDateAttributesToArray(attributes);
      // const mutatedAttributes = this.getMutatedAttributes();
      // attributes              = this.addMutatedAttributesToArray(attributes, mutatedAttributes);
      attributes = this.AddCastAttributesToArray(attributes);
      // for (let key of this.getArrayableAppends()) {
      //   attributes[key] = this.mutateAttributeForArray(key, null);
      // }
      return attributes;
    }

    /* Convert the model's attributes to an array. */
    public AttributesToArray2(this: Model & _Self) {
      let attributes = this.GetArrayableAttributes();
      // attributes     = this.addDateAttributesToArray(attributes);
      // const mutatedAttributes = this.getMutatedAttributes();
      // attributes              = this.addMutatedAttributesToArray(attributes, mutatedAttributes);
      attributes = this.AddCastAttributesToArray(attributes);
      // for (let key of this.getArrayableAppends()) {
      //   attributes[key] = this.mutateAttributeForArray(key, null);
      // }
      return attributes;
    }

    /* Add the date attributes to the attributes array. */
    protected AddDateAttributesToArray(this: Model & _Self, attributes: any) {
      for (const key of this.GetDates()) {
        if (attributes[key] == undefined) {
          continue;
        }
        attributes[key] = this.SerializeDate(this.AsDateTime(attributes[key]));
      }
      return attributes;
    }

    /* Add the mutated attributes to the attributes array. */
    // protected addMutatedAttributesToArray(attributes: any[], mutatedAttributes: any[]) {
    //   for (let key of mutatedAttributes) {
    //     if (!(key in attributes)) {
    //       continue;
    //     }
    //     attributes[key] = this.mutateAttributeForArray(key, attributes[key]);
    //   }
    //   return attributes;
    // }

    /* Add the casted attributes to the attributes array. */
    protected AddCastAttributesToArray(this: Model & this, attributes: any): Record<string, any> {
      for (const [key, value] of Object.entries(this.GetCasts())) {
        if (!Object.keys(attributes).includes(key)) {
          continue;
        }
        attributes[key] = this.CastAttribute(key, attributes[key]);
        if (attributes[key] && ['date', 'datetime', 'immutable_date', 'immutable_datetime'].includes(value)) {
          attributes[key] = this.SerializeDate(attributes[key]);
        }
        if (attributes[key] && (this.IsCustomDateTimeCast(value) || this.IsImmutableCustomDateTimeCast(value))) {
          attributes[key] = attributes[key].format(value.split(':')[1]);
        }
        if (attributes[key] && attributes[key] instanceof Date && this.IsClassCastable(key)) {
          attributes[key] = this.SerializeDate(attributes[key]);
        }
        // if (attributes[key] && this.isClassSerializable(key)) {
        //   attributes[key] = this.serializeClassCastableAttribute(key, attributes[key]);
        // }
        // if (attributes[key] instanceof Arrayable) {
        //   attributes[key] = attributes[key].toArray();
        // }
      }
      return attributes;
    }

    /* Get an attribute array of all arrayable attributes. */
    protected GetArrayableAttributes(this: Model & _Self): Record<string, any> {
      return this.GetArrayableItems(this.GetAttributes());
    }

    /* Get all of the appendable values that are arrayable. */
    protected GetArrayableAppends(this: Model & _Self): Record<string, any> {
      if (!this._appends.length) {
        return [];
      }
      return this.GetArrayableItems(this._appends);
    }

    /* Get the model's relationships in array form. */
    public RelationsToArray(this: Model & _Self): Record<string, any> {
      const attributes: any = {};
      for (let [key, value] of Object.entries(this.GetArrayableRelations())) {
        let relation;
        if (isArray(value)) {
          relation = value.map((it: Model) => it.ToArray());
        } else if (value instanceof BaseModel) {
          relation = (value as Model).ToArray();
        } else if (isBlank(value)) {
          relation = value;
        }
        if ((this.constructor as typeof Model).snakeAttributes) {
          key = snakeCase(key);
        }
        if (relation !== undefined || isBlank(value)) {
          attributes[key] = relation;
        }
      }
      return attributes;
    }

    /* Get the model's relationships in array form. */
    public RelationsToArray2(this: Model & _Self) {
      const attributes: any = {};
      for (let [key, value] of Object.entries(this.GetArrayableRelations())) {
        let relation;
        if (isArray(value)) {
          relation = value.map((it: Model) => it.ToArray());
        } else if (value instanceof BaseModel) {
          relation = (value as Model).ToArray();
        } else if (isBlank(value)) {
          relation = value;
        }
        if ((this.constructor as typeof Model).snakeAttributes) {
          key = snakeCase(key);
        }
        if (relation !== undefined || isBlank(value)) {
          attributes[key] = relation;
        }
      }
      return attributes;
    }

    /* Get an attribute array of all arrayable relations. */
    protected GetArrayableRelations(this: Model & _Self) {
      return this.GetArrayableItems(this._relations);
    }

    /* Get an attribute array of all arrayable values. */
    protected GetArrayableItems(this: Model & _Self, values: Record<string, any>): Record<string, any> {
      let haveNew = false;
      if (this.GetVisible().length > 0) {
        haveNew = true;
        values = pick(values, this.GetVisible());
      }
      if (this.GetHidden().length > 0) {
        haveNew = true;
        values = omit(values, this.GetHidden());
      }
      return haveNew ? values : { ...values };
    }

    public UnsetAttribute(key: string): void {
      delete this._attributes[key];
    }

    /* Get an attribute from the model. */
    public GetAttribute(this: Model & _Self, key: string) {
      if (!key) {
        return;
      }
      if (
        this._attributes.hasOwnProperty(key) ||
        // this._casts.hasOwnProperty(key) ||
        // this.hasGetMutator(key) ||
        this.IsClassCastable(key)
      ) {
        return this.GetAttributeValue(key);
      }
      // if (method_exists(HasAttributes, key)) {
      //   return;
      // }
      return this.GetRelationValue(key);
    }

    /* Get a plain attribute (not a relationship). */
    public GetAttributeValue(this: Model & _Self, key: string): any {
      return this.TransformModelValue(key, this._getAttributeFromArray(key));
    }

    /* Get an attribute from the Attributes array. */
    _getAttributeFromArray(key: string): any | null {
      return this.GetAttributes()[key] ?? null;
    }

    /* Get a relationship. */
    public GetRelationValue(this: Model & this, key: string): any | null {
      if (this.RelationLoaded(key)) {
        return this._relations[key];
      }

      const relationMetadata = this.IsRelation(key);
      if (!relationMetadata) {
        return;
      }

      // if (this._preventsLazyLoading) {
      //   this.handleLazyLoadingViolation(key);
      // }
      return this.GetRelationshipFromMethod(relationMetadata, key);
    }

    /* Determine if the given key is a relationship method on the model. */
    public IsRelation(key: string): (FedacoDecorator<ColumnAnnotation> & ColumnAnnotation) | undefined {
      const metadata = this._columnInfo(key);
      const isRelation = metadata && FedacoRelationColumn.isTypeOf(metadata);
      if (isRelation) {
        return metadata;
      }
      return undefined;
      // return method_exists(this, key) ||
      //   (HasAttributes.relationResolvers[get_class(this)][key] ?? null);
    }

    // /*Handle a lazy loading violation.*/
    // protected handleLazyLoadingViolation(key: string) {
    //   if (HasAttributes.lazyLoadingViolationCallback !== undefined) {
    //     return call_user_func(HasAttributes.lazyLoadingViolationCallback, this, key);
    //   }
    //   throw new LazyLoadingViolationException(this, key);
    // }

    /* Get a relationship value from a method. */
    protected async GetRelationshipFromMethod(
      this: Model & this,
      metadata: RelationColumnAnnotation,
      method: string,
    ): Promise<any | any[]> {
      const relation = metadata._getRelation(this, method);
      if (!(relation instanceof Relation)) {
        if (isBlank(relation)) {
          throw new Error(
            `LogicException getRelationshipFromMethod must return a relationship instance,` +
              ` but "null" was returned. Was the "return" keyword used?`,
          );
        }
        throw new Error(`LogicException(getRelationshipFromMethod must return a relationship instance.`);
      }
      return tap(await relation.getResults(), (results) => {
        this.SetRelation(method, results);
      });
    }

    // /*Determine if a get mutator exists for an attribute.*/
    // public hasGetMutator(key: string) {
    //   return method_exists(this, 'get' + Str.studly(key) + 'Attribute');
    // }
    //
    // /*Get the value of an attribute using its mutator.*/
    // protected mutateAttribute(key: string, value: any) {
    //   return this['get' + Str.studly(key) + 'Attribute'](value);
    // }

    /* Get the value of an attribute using its mutator for array conversion. */
    // protected mutateAttributeForArray(key: string, value: any) {
    //   this.isClassCastable(key) ?
    //     this.getClassCastableAttributeValue(key, value) :
    //     this.mutateAttribute(key, value);
    //   return value;
    // }

    /* Merge new casts with existing casts on the model. */
    public MergeCasts(this: Model & this, casts: any): this {
      // tslint:disable-next-line:ban
      if (isBlank(this._casts)) {
        this.GetCasts();
      }
      Object.assign(this._casts, casts);
      return this;
    }

    /* Cast an attribute to a native PHP type. */
    protected CastAttribute(this: Model & this, key: string, value: any): any {
      let castType = this.GetCastType(key);
      if (isBlank(value) && PrimitiveCastTypes.includes(castType)) {
        return value;
      }
      if (this.IsEncryptedCastable(key)) {
        value = this.FromEncryptedString(value);
        castType = castType.split('encrypted:').pop();
      }
      switch (castType) {
        case 'int':
        case 'integer':
          return /* cast type int */ value;
        case 'real':
        case 'float':
        case 'double':
          return this.FromFloat(value);
        case 'decimal':
          return this.AsDecimal(value, +this.GetCasts()[key].split(':')[1]);
        case 'string':
          return /* cast type string */ `${value}`;
        case 'bool':
        case 'boolean':
          return /* cast type bool */ value && value !== 'false';
        case 'object':
          return this.FromJson(value);
        case 'array':
        case 'json':
          return this.FromJson(value);
        case 'collection':
          return this.FromJson(value);
        case 'date':
          return this.AsDate(value);
        case 'datetime':
        case 'custom_datetime':
          return this.AsDateTime(value);
        // case 'immutable_date':
        //   return this.asDate(value).toImmutable();
        // case 'immutable_custom_datetime':
        // case 'immutable_datetime':
        //   return this.asDateTime(value).toImmutable();
        case 'timestamp':
          return this.AsTimestamp(value);
      }
      // if (this.isClassCastable(key)) {
      //   return this.getClassCastableAttributeValue(key, value);
      // }
      return value;
    }

    // /*Cast the given attribute using a custom cast class.*/
    // protected getClassCastableAttributeValue(key: string, value: any) {
    //   if (this._classCastCache[key] != undefined) {
    //     return this._classCastCache[key];
    //   } else {
    //     let caster = this.resolveCasterClass(key);
    //     let value  = caster instanceof CastsInboundAttributes ?
    //       value :
    //       caster.get(this, key, value, this.attributes);
    //     if (caster instanceof CastsInboundAttributes || !is_object(value)) {
    //       delete this._classCastCache[key];
    //     } else {
    //       this._classCastCache[key] = value;
    //     }
    //     return value;
    //   }
    // }

    /* Get the type of cast for a model attribute. */
    protected GetCastType(this: Model & this, key: string): string {
      // if (this.isCustomDateTimeCast(this.getCasts()[key])) {
      //   return 'custom_datetime';
      // }
      // if (this.isImmutableCustomDateTimeCast(this.getCasts()[key])) {
      //   return 'immutable_custom_datetime';
      // }
      if (this.IsDecimalCast(this.GetCasts()[key])) {
        return 'decimal';
      }
      return this.GetCasts()[key].toLowerCase().trim();
    }

    /* Increment or decrement the given attribute using the custom cast class. */
    // protected deviateClassCastableAttribute(method: string, key: string, value: any) {
    //   return this.resolveCasterClass(key)[method](this, key, value, this._attributes);
    // }
    //
    // /*Serialize the given attribute using the custom cast class.*/
    // protected serializeClassCastableAttribute(key: string, value: any) {
    //   return this.resolveCasterClass(key).serialize(this, key, value, this._attributes);
    // }

    /* Determine if the cast type is a custom date time cast. */
    protected IsCustomDateTimeCast(cast: string): boolean {
      const a: any = this._columnInfo(cast);
      return a && (a.isTypeof(DateColumn) || a.isTypeof(DatetimeColumn));

      // return str_starts_with(cast, 'date:') || str_starts_with(cast, 'datetime:');
    }

    /* Determine if the cast type is an immutable custom date time cast. */
    protected IsImmutableCustomDateTimeCast(cast: string): boolean {
      return cast.startsWith('immutable_date:') || cast.startsWith('immutable_datetime:');
    }

    /* Determine if the cast type is a decimal cast. */
    protected IsDecimalCast(cast: string): boolean {
      return cast.startsWith('decimal:');
    }

    /* Set a given attribute on the model. */
    public SetAttribute(this: Model & this, key: string, value: any): this {
      /* if (this.hasSetMutator(key)) {
        return this.setMutatedAttributeValue(key, value);
      } else */
      if (value && this.IsDateAttribute(key)) {
        value = this.FromDateTime(value);
      }
      if (this.IsClassCastable(key)) {
        this.SetClassCastableAttribute(key, value);
        return this;
      }
      if (!isBlank(value) && this.IsJsonCastable(key)) {
        value = this.CastAttributeAsJson(key, value);
      }
      if (key.includes('->')) {
        return this.FillJsonAttribute(key, value);
      }
      if (!isBlank(value) && this.IsEncryptedCastable(key)) {
        value = this.CastAttributeAsEncryptedString(key, value);
      }
      this._attributes[key] = value;
      return this;
    }

    // /*Determine if a set mutator exists for an attribute.*/
    // public hasSetMutator(key: string) {
    //   return method_exists(this, 'set' + Str.studly(key) + 'Attribute');
    // }

    // /*Set the value of an attribute using its mutator.*/
    // protected setMutatedAttributeValue(key: string, value: any) {
    //   return this['set' + Str.studly(key) + 'Attribute'](value);
    // }

    protected _scopeInfo(key: string): (FedacoDecorator<ColumnAnnotation> & ScopeAnnotation) | undefined {
      const typeOfClazz = this.constructor as typeof Model;
      const meta = reflector.propMetadata(typeOfClazz);
      if (meta[key] && isArray(meta[key])) {
        return findLast((it) => {
          return Scope.isTypeOf(it);
        }, meta[key]) as (FedacoDecorator<ColumnAnnotation> & ScopeAnnotation) | undefined;
      }
      return undefined;
    }

    protected _columnInfo(key: string): (FedacoDecorator<ColumnAnnotation> & ColumnAnnotation) | undefined {
      const typeOfClazz = this.constructor as typeof Model;
      const meta = reflector.propMetadata(typeOfClazz);
      if (meta[key] && isArray(meta[key])) {
        return findLast((it) => {
          return FedacoColumn.isTypeOf(it) || FedacoRelationColumn.isTypeOf(it);
        }, meta[key]) as (FedacoDecorator<ColumnAnnotation> & ColumnAnnotation) | undefined;
      }
      return undefined;
    }

    /* Determine if the given attribute is a date or date castable. */
    protected IsDateAttribute(this: Model & this, key: string): boolean {
      const a = this._columnInfo(key);

      return (
        DateColumn.isTypeOf(a) || DatetimeColumn.isTypeOf(a) || TimestampColumn.isTypeOf(a) || this.IsDateCastable(key)
      );
      // return in_array(key, this.getDates(), true) || this.isDateCastable(key);
    }

    /* Set a given JSON attribute on the model. */
    public FillJsonAttribute(this: Model & this, key: string, value: any): this {
      let path;
      [key, ...path] = key.split('->');
      value = this.AsJson(this.GetArrayAttributeWithValue(path.join('->'), key, value));
      this._attributes[key] = this.IsEncryptedCastable(key) ? this.CastAttributeAsEncryptedString(key, value) : value;
      return this;
    }

    /* Set the value of a class castable attribute. */
    protected SetClassCastableAttribute(key: string, value: any): void {
      // let caster       = this.resolveCasterClass(key);
      this._attributes = {
        ...this._attributes /* ...this.normalizeCastClassResponse(key,
          caster.set(this, key, value, this._attributes)) */,
      };
      // if (caster instanceof CastsInboundAttributes || !isObject(value)) {
      //   delete this._classCastCache[key];
      // } else {
      //   this._classCastCache[key] = value;
      // }
    }

    /* Get an array attribute with the given key and value set. */
    protected GetArrayAttributeWithValue(path: string, key: string, value: any): any {
      return tap(this.GetArrayAttributeByKey(key), (target) => {
        set(target, path.replace('->', '.'), value);
      });
    }

    /* Get an array attribute or return an empty array if it is not set. */
    protected GetArrayAttributeByKey(key: string): any {
      if (isBlank(this._attributes[key])) {
        return {};
      }
      // todo encrypted
      return this.FromJson(
        /* this.isEncryptedCastable(key) ? this.fromEncryptedString(
        this._attributes[key]) : */ this._attributes[key],
      );
    }

    /* Cast the given attribute to JSON. */
    protected CastAttributeAsJson(key: string, value: any): string {
      try {
        value = this.AsJson(value);
        return value;
      } catch (e) {
        throw new Error('JsonEncodingException.forAttribute(this, key, json_last_error_msg())');
      }
    }

    /* Encode the given value as JSON. */
    protected AsJson(value: any) {
      return JSON.stringify(value);
    }

    /* Decode the given JSON back into an array or object. */
    public FromJson(value: string) {
      return JSON.parse(value) as any;
    }

    /* Decrypt the given encrypted string. */
    public FromEncryptedString(value: string) {
      throw new Error('not implemented encrypted string');
      // return (HasAttributes.encrypter ?? Crypt.getFacadeRoot()).decrypt(value, false);
    }

    //
    /* Cast the given attribute to an encrypted string. */
    protected CastAttributeAsEncryptedString(key: string, value: any) {
      return ((this.constructor as any).encrypter ?? Crypt.getCryptor()).encrypt(value, false);
    }

    /* Set the encrypter instance that will be used to encrypt attributes. */
    public static encryptUsing(encrypter: Encrypter) {
      (this.constructor as any).encrypter = encrypter;
    }

    /* Decode the given float. */
    public FromFloat(value: any): number {
      switch (/* cast type string */ value) {
        case 'Infinity':
          return Infinity;
        case '-Infinity':
          return -Infinity;
        case 'NaN':
          return NaN;
        default:
          return /* cast type float */ value;
      }
    }

    /* Return a decimal as string. */
    protected AsDecimal(value: string | number, decimals: number): string {
      try {
        // 使用 Decimal 进行高精度计算
        const result = new Decimal(value).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP);
        return result.toString();
      } catch (error) {
        throw new Error(`Unable to cast value to a decimal. ${error}`);
      }
    }

    /* Return a timestamp as DateTime object with time set to 00:00:00. */
    protected AsDate(this: Model & _Self, value: any): Date {
      return startOfDay(this.AsDateTime(value));
    }

    /* Return a timestamp as DateTime object. */
    protected AsDateTime(this: Model & _Self, value: any): Date {
      if (value instanceof Date) {
        return value;
      }
      if (isNumber(value)) {
        return new Date(value * 1000);
      }
      if (this.IsStandardDateFormat(value)) {
        return parse(value, 'yyyy-MM-dd', new Date());
      }
      let date;
      try {
        date = parse(value, this.GetDateFormat() || 'yyyy-MM-dd HH:mm:ss', new Date(value));
      } catch (e) {}
      if (isValid(date)) {
        return date;
      } else {
        throw new Error(`invalid date ${value}`);
      }
    }

    /* Determine if the given value is a standard date format. */
    protected IsStandardDateFormat(value: string): boolean {
      return /^(\d{4})-(\d{1,2})-(\d{1,2})$/.test(value);
    }

    /* Convert a DateTime to a storable string. */
    public FromDateTime(this: Model & _Self, value: any): string | null {
      return isBlank(value) ? value : format(this.AsDateTime(value), this.GetDateFormat());
    }

    /* Return a timestamp as unix timestamp. */
    protected AsTimestamp(this: Model & _Self, value: any): number {
      return getUnixTime(+this.AsDateTime(value));
    }

    /* Prepare a date for array / JSON serialization. */
    protected SerializeDate(date: Date): string {
      return formatISO(date);
    }

    /* Get the attributes that should be converted to dates. */
    public GetDates(this: Model & this): any[] {
      if (!this.UsesTimestamps()) {
        return this._dates;
      }
      const defaults = [this.GetCreatedAtColumn(), this.GetUpdatedAtColumn()];
      return uniq([...this._dates, ...defaults]);
    }

    /* Get the format for database stored dates. */
    public GetDateFormat(this: Model & this): string {
      return this._dateFormat || this.GetConnection().getQueryGrammar().getDateFormat();
    }

    /* Set the date format used by the model. */

    // tslint:disable-next-line:no-shadowed-variable
    public SetDateFormat(format: string): this {
      this._dateFormat = format;
      return this;
    }

    /* Determine whether an attribute should be cast to a native type. */
    public HasCast(this: Model & this, key: string, types: any[] | string | null = null): boolean {
      if (key in this.GetCasts()) {
        return types ? types.includes(this.GetCastType(key)) : true;
      }
      return false;
    }

    /* Get the casts array. */
    public GetCasts(this: Model & this): Record<string, any> {
      if (isBlank(this._casts)) {
        const typeOfClazz = this.constructor as typeof Model;
        const metas = reflector.propMetadata(typeOfClazz);
        const casts: any = {};
        for (const [key, meta] of Object.entries(metas)) {
          const columnMeta = findLast((it) => {
            return FedacoColumn.isTypeOf(it);
          }, meta);
          switch (true) {
            case PrimaryColumn.isTypeOf(columnMeta):
              casts[key] = columnMeta.keyType || 'int';
              break;
            case PrimaryGeneratedColumn.isTypeOf(columnMeta):
              // todo check not encrypted. not guid
              casts[key] = 'int';
              break;
            case BinaryColumn.isTypeOf(columnMeta):
              casts[key] = 'binary';
              break;
            case BooleanColumn.isTypeOf(columnMeta):
              casts[key] = 'boolean';
              break;
            case CurrencyColumn.isTypeOf(columnMeta):
              casts[key] = 'currency';
              break;
            case DateColumn.isTypeOf(columnMeta):
              casts[key] = 'date';
              break;
            case DatetimeColumn.isTypeOf(columnMeta):
              casts[key] = 'datetime';
              break;
            case DecimalColumn.isTypeOf(columnMeta):
              casts[key] = `decimal:${columnMeta.precision ?? 2}`;
              break;
            case FloatColumn.isTypeOf(columnMeta):
              casts[key] = 'float';
              break;
            case IntegerColumn.isTypeOf(columnMeta):
              casts[key] = 'integer';
              break;
            case JsonColumn.isTypeOf(columnMeta):
              casts[key] = 'json';
              break;
            case ArrayColumn.isTypeOf(columnMeta):
              casts[key] = 'array';
              break;
            case ObjectColumn.isTypeOf(columnMeta):
              casts[key] = 'object';
              break;
            case TextColumn.isTypeOf(columnMeta):
              casts[key] = 'string';
              break;
            case TimestampColumn.isTypeOf(columnMeta):
              casts[key] = 'timestamp';
              break;
          }
        }

        this._casts = casts;
      }
      return this._casts;
    }

    /* Determine whether a value is Date / DateTime castable for inbound manipulation. */
    protected IsDateCastable(this: Model & this, key: string): boolean {
      return this.HasCast(key, ['date', 'datetime', 'immutable_date', 'immutable_datetime']);
    }

    /* Determine whether a value is JSON castable for inbound manipulation. */
    protected IsJsonCastable(this: Model & this, key: string): boolean {
      return this.HasCast(key, [
        'array',
        'json',
        'object',
        'collection',
        'encrypted:array',
        'encrypted:collection',
        'encrypted:json',
        'encrypted:object',
      ]);
    }

    /* Determine whether a value is an encrypted castable for inbound manipulation. */
    protected IsEncryptedCastable(this: Model & this, key: string) {
      return this.HasCast(key, [
        'encrypted',
        'encrypted:array',
        'encrypted:collection',
        'encrypted:json',
        'encrypted:object',
      ]);
    }

    /* Determine if the given key is cast using a custom class. */
    protected IsClassCastable(this: Model & this, key: string) {
      if (!Object.keys(this.GetCasts()).includes(key)) {
        return false;
      }

      const castType = this.GetCastType(key);
      if (isString(castType) && PrimitiveCastTypes.includes(castType)) {
        return false;
      }
      if (isFunction(castType)) {
        return true;
      }
      // if (class_exists(castType)) {
      //   return true;
      // }
      throw new Error(`InvalidCastException(this.getModel(), key, castType)`);
    }

    // /*Determine if the key is deviable using a custom class.*/
    // protected isClassDeviable(key: string) {
    //   return this.isClassCastable(key) && method_exists(
    //     castType = this.parseCasterClass(this.getCasts()[key]), 'increment') && method_exists(
    //       castType, 'decrement');
    // }

    // /*Determine if the key is serializable using a custom class.*/
    // protected isClassSerializable(key: string) {
    //   return this.isClassCastable(key) && method_exists(this.parseCasterClass(this.getCasts()[key]),
    //     'serialize');
    // }

    /* Resolve the custom caster class for a given key. */
    // protected resolveCasterClass(key: string) {
    //   let castType = this.getCasts()[key];
    //   let arguments = [];
    //   if (is_string(castType) && strpos(castType, ':') !== false) {
    //     let segments = castType.split(':');
    //     let castType = segments[0];
    //     let arguments = segments[1].split(',');
    //   }
    //   if (is_subclass_of(castType, Castable)) {
    //     let castType = castType.castUsing(arguments);
    //   }
    //   if (is_object(castType)) {
    //     return castType;
    //   }
    //   return new castType(());
    // }

    // /*Parse the given caster class, removing any arguments.*/
    // protected parseCasterClass(clazz: string) {
    //   return strpos(clazz, ':') === false ? clazz : clazz.split(':')[0];
    // }

    /* Merge the cast class attributes back into the model. */
    protected MergeAttributesFromClassCasts(): void {
      // for (const [key, value] of Object.entries(this._classCastCache)) {
      //   // let caster = this.resolveCasterClass(key);
      //   this._attributes = {
      //     ...this._attributes,
      //     // ...(
      //     // caster instanceof CastsInboundAttributes ? {} :
      //     // this.normalizeCastClassResponse(key, caster.set(this, key, value, this._attributes)
      //     // )
      //     // )
      //   };
      // }
    }

    /* Normalize the response from a custom class caster. */
    // protected normalizeCastClassResponse(key: string, value: any) {
    //   return isArray(value) ? value : {};
    // }

    /* Get all of the current attributes on the model. */
    public GetAttributes(): Record<string, any> {
      this.MergeAttributesFromClassCasts();
      return this._attributes;
    }

    /* Get all of the current attributes on the model for an insert operation. */
    protected GetAttributesForInsert(): Record<string, any> {
      return this.GetAttributes();
    }

    /* Set the array of model attributes. No checking is done. */
    public SetRawAttributes(attributes: Record<string, any>, sync = false): this {
      this._attributes = attributes;
      if (sync) {
        this.SyncOriginal();
      }
      this._classCastCache = [];
      return this;
    }

    /* Get the model's original attribute values. */
    public GetOriginal(this: Model & _Self, key?: string, _default?: any): Record<string, any> {
      // @ts-ignore
      return (new this.constructor() as Model)
        .SetRawAttributes(this._original, true)
        .GetOriginalWithoutRewindingModel(key, _default);
    }

    /* Get the model's original attribute values. */
    protected GetOriginalWithoutRewindingModel(this: Model & _Self, key?: string, _default?: any): Record<string, any> {
      if (key) {
        return this.TransformModelValue(key, get(this._original, key, _default));
      }
      const results: any = {};
      for (const [_key, value] of Object.entries(this._original)) {
        results[_key] = this.TransformModelValue(_key, value);
      }
      return results;
    }

    /* Get the model's raw original attribute values. */
    public GetRawOriginal(key?: string, _default?: any): any {
      return get(this._original, key, _default);
    }

    /* Get a subset of the model's attributes. */
    public Only(this: Model & _Self, ...attributes: any[]): Record<string, any>;
    public Only(this: Model & _Self, attributes: any[] | any): Record<string, any> {
      const results: any = {};
      for (const attribute of isArray(attributes) ? attributes : arguments) {
        results[attribute] = this.GetAttribute(attribute);
      }
      return results;
    }

    /* Sync the original attributes with the current. */
    public SyncOriginal(): this {
      // todo remove spread
      this._original = { ...this.GetAttributes() };
      return this;
    }

    /* Sync a single original attribute with its current value. */
    public SyncOriginalAttribute(attribute: string): this {
      return this.SyncOriginalAttributes(attribute);
    }

    /* Sync multiple original attribute with their current values. */
    public SyncOriginalAttributes(attributes: any[] | string): this {
      attributes = isArray(attributes) ? attributes : (arguments as unknown as any[]);
      const modelAttributes = this.GetAttributes();
      for (const attribute of attributes) {
        this._original[attribute] = modelAttributes[attribute];
      }
      return this;
    }

    /* Sync the changed attributes. */
    public SyncChanges(this: Model & _Self): this {
      this._changes = this.GetDirty();
      // @ts-ignore
      return this;
    }

    public IsDirty(this: Model & _Self, ...args: string[]): boolean;
    /* Determine if the model or any of the given attribute(s) have been modified. */
    public IsDirty(this: Model & _Self, attributes: any[] | string | null = null): boolean {
      return this.HasChanges(this.GetDirty(), isArray(attributes) ? attributes : ([...arguments] as unknown as any[]));
    }

    /* Determine if the model or all the given attribute(s) have remained the same. */
    public IsClean(this: Model & _Self, ...attributes: string[] | string[][]) {
      return !this.IsDirty(...attributes);
    }

    /* Determine if the model or any of the given attribute(s) have been modified. */
    public WasChanged(this: Model & _Self, attributes?: any[] | string): boolean {
      return this.HasChanges(
        this.GetChanges(),
        isArray(attributes) ? attributes : ([...arguments] as unknown as any[]),
      );
    }

    /* Determine if any of the given attributes were changed. */
    protected HasChanges(this: Model & _Self, changes: Record<string, any>, attributes?: any[] | string) {
      if (!attributes || !attributes.length) {
        return !isObjectEmpty(changes);
      }
      for (const attribute of wrap(attributes)) {
        if (attribute in changes) {
          return true;
        }
      }
      return false;
    }

    /* Get the attributes that have been changed since the last sync. */
    public GetDirty(this: Model & _Self): Record<string, any> {
      const dirty: any = {};
      for (const [key, value] of Object.entries(this.GetAttributes())) {
        if (!this.OriginalIsEquivalent(key)) {
          dirty[key] = value;
        }
      }
      return dirty;
    }

    /* Get the attributes that were changed. */
    public GetChanges(): Record<string, any> {
      return this._changes;
    }

    /* Determine if the new and old values for a given key are equivalent. */
    public OriginalIsEquivalent(this: Model & _Self, key: string): boolean {
      if (!(key in this._original)) {
        return false;
      }
      const attribute = get(this._attributes, key);
      const original = get(this._original, key);
      if (attribute === original) {
        return true;
      } else if (isBlank(attribute)) {
        return false;
      } else if (this.IsDateAttribute(key)) {
        return this.FromDateTime(attribute) === this.FromDateTime(original);
      } else if (this.HasCast(key, ['object', 'collection', 'json', 'array'])) {
        return equals(this.CastAttribute(key, attribute), this.CastAttribute(key, original));
      } else if (this.HasCast(key, ['real', 'float', 'double'])) {
        if ((attribute == null && original != null) || (attribute != null && original == null)) {
          return false;
        }
        return Math.abs(this.CastAttribute(key, attribute) - this.CastAttribute(key, original)) < EPSILON * 4;
      } else if (this.HasCast(key, PrimitiveCastTypes)) {
        return equals(this.CastAttribute(key, attribute), this.CastAttribute(key, original));
      }
      return isNumber(attribute) && isNumber(original) && attribute === original;
    }

    /* Transform a raw model value using mutators, casts, etc. */
    protected TransformModelValue(this: Model & this, key: string, value: any): any {
      // if (this.hasGetMutator(key)) {
      //   return this.mutateAttribute(key, value);
      // }
      if (this.HasCast(key)) {
        return this.CastAttribute(key, value);
      }
      if (value != null && this.GetDates().includes(key)) {
        return this.AsDateTime(value);
      }
      return value;
    }

    /* Append attributes to query when building a query. */
    public Append(attributes: any[] | string): this {
      this._appends = uniq([...this._appends, ...(isString(attributes) ? arguments : attributes)]);
      return this;
    }

    /* Set the accessors to append to model arrays. */
    public SetAppends(appends: any[]): this {
      this._appends = appends;
      return this;
    }

    /* Return whether the accessor attribute has been appended. */
    public HasAppended(attribute: string): boolean {
      return attribute in this._appends;
    }

    // /*Get the mutated attributes for a given instance.*/
    // public getMutatedAttributes() {
    //   var clazz = HasAttributes;
    //   if (!(HasAttributes.mutatorCache[clazz] !== undefined)) {
    //     HasAttributes.cacheMutatedAttributes(clazz);
    //   }
    //   return HasAttributes.mutatorCache[clazz];
    // }

    // /*Extract and cache all the mutated attributes of a class.*/
    // public static cacheMutatedAttributes(clazz: string) {
    //   HasAttributes.mutatorCache[clazz] = collect(HasAttributes.getMutatorMethods(clazz)).map(
    //     match => {
    //       return lcfirst(HasAttributes.snakeAttributes ? Str.snake(match) : match);
    //     }).all();
    // }

    // /*Get all of the attribute mutator methods.*/
    // protected static getMutatorMethods(clazz: any) {
    //   preg_match_all('/(?<=^|;)get([^;]+?)Attribute(;|$)/', get_class_methods(clazz).join(';'),
    //     matches);
    //   return matches[1];
    // }

    // /*Get the mutated attributes for a given instance.*/
    // public getMutatedAttributes() {
    //   let clazz = HasAttributes;
    //   if (!(HasAttributes.mutatorCache[clazz] !== undefined)) {
    //     HasAttributes.cacheMutatedAttributes(clazz);
    //   }
    //   return HasAttributes.mutatorCache[clazz];
    // }

    // /*Extract and cache all the mutated attributes of a class.*/
    // public static cacheMutatedAttributes(clazz: string) {
    //   HasAttributes.mutatorCache[clazz] = collect(HasAttributes.getMutatorMethods(clazz)).map(
    //     match => {
    //       return lcfirst(HasAttributes.snakeAttributes ? Str.snake(match) : match);
    //     }).all();
    // }
    //
    // /*Get all of the attribute mutator methods.*/
    // protected static getMutatorMethods(clazz: any) {
    //   preg_match_all('/(?<=^|;)get([^;]+?)Attribute(;|$)/', get_class_methods(clazz).join(';'),
    //     matches);
    //   return matches[1];
    // }
  };
}
