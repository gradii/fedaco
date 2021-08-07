// import { CarbonInterface } from 'Carbon/CarbonInterface';
// import { DateTimeInterface } from 'DateTimeInterface';
// import { Castable } from 'Illuminate/Contracts/Database/Eloquent/Castable';
// import { CastsInboundAttributes } from 'Illuminate/Contracts/Database/Eloquent/CastsInboundAttributes';
// import { Arrayable } from 'Illuminate/Contracts/Support/Arrayable';
// import { JsonEncodingException } from '../JsonEncodingException';
// import { Relation } from '../Relations/Relation';
// import { Arr } from '@gradii/common';
// import { Carbon } from 'Illuminate/Support/Carbon';
// import { Collection as BaseCollection } from 'Illuminate/Support/Collection';
// import { Date } from 'Illuminate/Support/Facades/Date';
// import { Str } from '@gradii/common';
// import { LogicException } from 'LogicException';
// import { Constructor } from './constructor';

import { isArray } from '@gradii/check-type';
import { Constructor } from '../../helper/constructor';


/** Mixin to augment a directive with a `disableRipple` property. */
export function mixinHasAttributes<T extends Constructor<{}>>(base: T) {
  //@ts-ignore
  return class HasAttributes extends base {
    /*Indicates whether attributes are snake cased on arrays.*/
    public static snakeAttributes: boolean = true;
    /*The built-in, primitive cast types supported by Eloquent.*/
    protected static primitiveCastTypes: any[] = [
      'array', 'bool', 'boolean', 'collection', 'custom_datetime', 'date', 'datetime', 'decimal',
      'double', 'float', 'int', 'integer', 'json', 'object', 'real', 'string', 'timestamp'
    ];
    /*The cache of the mutated attributes for each class.*/
    protected static mutatorCache: any[] = [];
    /*The model's attributes.*/
    protected attributes: any[] = [];
    /*The model attribute's original state.*/
    protected original: any[] = [];
    /*The changed model attributes.*/
    protected changes: any[] = [];
    /*The attributes that should be cast.*/
    protected casts: any[] = [];
    /*The attributes that have been cast using custom classes.*/
    protected classCastCache: any[] = [];
    /*The attributes that should be mutated to dates.*/
    protected dates: any[] = [];
    /*The storage format of the model's date columns.*/
    protected dateFormat: string;
    /*The accessors to append to the model's array form.*/
    protected appends: any[] = [];

    constructor(...args: any[]) {
      super(...args);
    }

    /*Extract and cache all the mutated attributes of a class.*/
    public static cacheMutatedAttributes(clazz: string) {
      (this.constructor as unknown as typeof HasAttributes).mutatorCache[clazz] = collect((this.constructor as unknown as typeof HasAttributes).getMutatorMethods(
        clazz)).map(match => {
        return lcfirst(
          (this.constructor as unknown as typeof HasAttributes).snakeAttributes ?
            Str.snake(match) :
            match
        );
      }).all();
    }

    /*Get all of the attribute mutator methods.*/
    protected static getMutatorMethods(clazz: any) {
      preg_match_all('/(?<=^|;)get([^;]+?)Attribute(;|$)/', get_class_methods(clazz).join(';'), matches);
      return matches[1];
    }

    /*Convert the model's attributes to an array.*/
    public attributesToArray() {
      let attributes, mutatedAttributes;
      attributes = this.addDateAttributesToArray(attributes = this.getArrayableAttributes());
      attributes = this.addMutatedAttributesToArray(attributes, mutatedAttributes = this.getMutatedAttributes());
      attributes = this.addCastAttributesToArray(attributes, mutatedAttributes);
      for (let key of this.getArrayableAppends()) {
        attributes[key] = this.mutateAttributeForArray(key, null);
      }
      return attributes;
    }

    /*Get the model's relationships in array form.*/
    public relationsToArray() {
      var attributes = [];
      for (let [key, value] of Object.entries(this.getArrayableRelations())) {
        if (value instanceof Arrayable) {
          var relation = value.toArray();
        } else if (isBlank(value)) {
          var relation = value;
        }
        if ((this.constructor as unknown as typeof HasAttributes).snakeAttributes) {
          var key = Str.snake(key);
        }
        if (relation !== undefined || isBlank(value)) {
          attributes[key] = relation;
        }
        delete relation;
      }
      return attributes;
    }

    /*Get an attribute from the model.*/
    public getAttribute(key: string) {
      if (!key) {
        return;
      }
      if (array_key_exists(key, this.attributes) || array_key_exists(key,
        this.casts) || this.hasGetMutator(key) || this.isClassCastable(key)) {
        return this.getAttributeValue(key);
      }
      if (method_exists(HasAttributes, key)) {
        return;
      }
      return this.getRelationValue(key);
    }

    /*Get a plain attribute (not a relationship).*/
    public getAttributeValue(key: string) {
      return this.transformModelValue(key, this.getAttributeFromArray(key));
    }

    /*Get a relationship.*/
    public getRelationValue(key: string) {
      if (this.relationLoaded(key)) {
        return this.relations[key];
      }
      if (method_exists(this,
        key) || ((this.constructor as unknown as typeof HasAttributes).relationResolvers[get_class(this)][key] ?? null)) {
        return this.getRelationshipFromMethod(key);
      }
    }

    /*Determine if a get mutator exists for an attribute.*/
    public hasGetMutator(key: string) {
      return method_exists(this, 'get' + Str.studly(key) + 'Attribute');
    }

    /*Merge new casts with existing casts on the model.*/
    public mergeCasts(casts: any[]) {
      this.casts = [...this.casts, ...casts];
    }

    /*Set a given attribute on the model.*/
    public setAttribute(key: string, value: any) {
      if (this.hasSetMutator(key)) {
        return this.setMutatedAttributeValue(key, value);
      } else if (value && this.isDateAttribute(key)) {
        var value = this.fromDateTime(value);
      }
      if (this.isClassCastable(key)) {
        this.setClassCastableAttribute(key, value);
        return this;
      }
      if (this.isJsonCastable(key) && !isBlank(value)) {
        var value = this.castAttributeAsJson(key, value);
      }
      if (Str.contains(key, '->')) {
        return this.fillJsonAttribute(key, value);
      }
      this.attributes[key] = value;
      return this;
    }

    /*Determine if a set mutator exists for an attribute.*/
    public hasSetMutator(key: string) {
      return method_exists(this, 'set' + Str.studly(key) + 'Attribute');
    }

    /*Set a given JSON attribute on the model.*/
    public fillJsonAttribute(key: string, value: any) {
      const [key, path] = key.split('->');
      this.attributes[key] = this.asJson(this.getArrayAttributeWithValue(path, key, value));
      return this;
    }

    /*Decode the given JSON back into an array or object.*/
    public fromJson(value: string, asObject: boolean = false) {
      return json_decode(value, !asObject);
    }

    /*Decode the given float.*/
    public fromFloat(value: any) {
      switch (
        //cast type string
        value) {
        case 'Infinity':
          return INF;
        case '-Infinity':
          return -INF;
        case 'NaN':
          return NaN;
        default:
          return;
          //cast type float
          value;
      }
    }

    /*Convert a DateTime to a storable string.*/
    public fromDateTime(value: any) {
      return empty(value) ? value : this.asDateTime(value).format(this.getDateFormat());
    }

    /*Get the attributes that should be converted to dates.*/
    public getDates() {
      var defaults = [this.getCreatedAtColumn(), this.getUpdatedAtColumn()];
      return this.usesTimestamps() ? array_unique([...this.dates, ...defaults]) : this.dates;
    }

    /*Get the format for database stored dates.*/
    public getDateFormat() {
      return this.dateFormat || this.getConnection().getQueryGrammar().getDateFormat();
    }

    /*Set the date format used by the model.*/
    public setDateFormat(format: string) {
      this.dateFormat = format;
      return this;
    }

    /*Determine whether an attribute should be cast to a native type.*/
    public hasCast(key: string, types: any[] | string | null = null) {
      if (array_key_exists(key, this.getCasts())) {
        return types ? in_array(this.getCastType(key),
          //cast type array
          types, true) : true;
      }
      return false;
    }

    /*Get the casts array.*/
    public getCasts() {
      if (this.getIncrementing()) {
        return [...{}, ...this.casts];
      }
      return this.casts;
    }

    /*Get all of the current attributes on the model.*/
    public getAttributes() {
      this.mergeAttributesFromClassCasts();
      return this.attributes;
    }

    /*Set the array of model attributes. No checking is done.*/
    public setRawAttributes(attributes: any[], sync: boolean = false) {
      this.attributes = attributes;
      if (sync) {
        this.syncOriginal();
      }
      this.classCastCache = [];
      return this;
    }

    /*Get the model's original attribute values.*/
    public getOriginal(key: string | null = null, _default: any = null) {
      return new HasAttributes().setRawAttributes(this.original, sync = true).getOriginalWithoutRewindingModel(key,
        _default);
    }

    /*Get the model's raw original attribute values.*/
    public getRawOriginal(key: string | null = null, _default: any = null) {
      return Arr.get(this.original, key, _default);
    }

    /*Get a subset of the model's attributes.*/
    public only(attributes: any[] | any) {
      var results = [];
      for (let attribute of isArray(attributes) ? attributes : func_get_args()) {
        results[attribute] = this.getAttribute(attribute);
      }
      return results;
    }

    /*Sync the original attributes with the current.*/
    public syncOriginal() {
      this.original = this.getAttributes();
      return this;
    }

    /*Sync a single original attribute with its current value.*/
    public syncOriginalAttribute(attribute: string) {
      return this.syncOriginalAttributes(attribute);
    }

    /*Sync multiple original attribute with their current values.*/
    public syncOriginalAttributes(attributes: any[] | string) {
      var attributes = isArray(attributes) ? attributes : func_get_args();
      var modelAttributes = this.getAttributes();
      for (let attribute of attributes) {
        this.original[attribute] = modelAttributes[attribute];
      }
      return this;
    }

    /*Sync the changed attributes.*/
    public syncChanges() {
      this.changes = this.getDirty();
      return this;
    }

    /*Determine if the model or any of the given attribute(s) have been modified.*/
    public isDirty(attributes: any[] | string | null = null) {
      return this.hasChanges(this.getDirty(), isArray(attributes) ? attributes : func_get_args());
    }

    /*Determine if the model and all the given attribute(s) have remained the same.*/
    public isClean(attributes: any[] | string | null = null) {
      return !this.isDirty(());
    }

    /*Determine if the model or any of the given attribute(s) have been modified.*/
    public wasChanged(attributes: any[] | string | null = null) {
      return this.hasChanges(this.getChanges(), isArray(attributes) ? attributes : arguments);
    }

    /*Get the attributes that have been changed since last sync.*/
    public getDirty() {
      const dirty = [];
      for (const [key, value] of Object.entries(this.getAttributes())) {
        if (!this.originalIsEquivalent(key)) {
          dirty[key] = value;
        }
      }
      return dirty;
    }

    /*Get the attributes that were changed.*/
    public getChanges() {
      return this.changes;
    }

    /*Determine if the new and old values for a given key are equivalent.*/
    public originalIsEquivalent(key: string) {
      if (!array_key_exists(key, this.original)) {
        return false;
      }
      var attribute = Arr.get(this.attributes, key);
      var original = Arr.get(this.original, key);
      if (attribute === original) {
        return true;
      } else if (isBlank(attribute)) {
        return false;
      } else if (this.isDateAttribute(key)) {
        return this.fromDateTime(attribute) === this.fromDateTime(original);
      } else if (this.hasCast(key, ['object', 'collection'])) {
        return this.castAttribute(key, attribute) == this.castAttribute(key, original);
      } else if (this.hasCast(key, ['real', 'float', 'double'])) {
        if (attribute === null && original !== null || attribute !== null && original === null) {
          return false;
        }
        return abs(this.castAttribute(key, attribute) - this.castAttribute(key, original)) < PHP_FLOAT_EPSILON * 4;
      } else if (this.hasCast(key, (this.constructor as unknown as typeof HasAttributes).primitiveCastTypes)) {
        return this.castAttribute(key, attribute) === this.castAttribute(key, original);
      }
      return is_numeric(attribute) && is_numeric(original) && strcmp(
        //cast type string
        attribute,
        //cast type string
        original) === 0;
    }

    /*Append attributes to query when building a query.*/
    public append(attributes: any[] | string) {
      this.appends = array_unique([...this.appends, ...(isString(attributes) ? func_get_args() : attributes)]);
      return this;
    }

    /*Set the accessors to append to model arrays.*/
    public setAppends(appends: any[]) {
      this.appends = appends;
      return this;
    }

    /*Return whether the accessor attribute has been appended.*/
    public hasAppended(attribute: string) {
      return this.appends.includes(attribute);
    }

    /*Get the mutated attributes for a given instance.*/
    public getMutatedAttributes() {
      var clazz = HasAttributes;
      if (!((this.constructor as unknown as typeof HasAttributes).mutatorCache[clazz] !== undefined)) {
        (this.constructor as unknown as typeof HasAttributes).cacheMutatedAttributes(clazz);
      }
      return (this.constructor as unknown as typeof HasAttributes).mutatorCache[clazz];
    }

    /*Add the date attributes to the attributes array.*/
    protected addDateAttributesToArray(attributes: any[]) {
      for (let key of this.getDates()) {
        if (!(attributes[key] !== undefined)) {
          continue;
        }
        attributes[key] = this.serializeDate(this.asDateTime(attributes[key]));
      }
      return attributes;
    }

    /*Add the mutated attributes to the attributes array.*/
    protected addMutatedAttributesToArray(attributes: any[], mutatedAttributes: any[]) {
      for (let key of mutatedAttributes) {
        if (!array_key_exists(key, attributes)) {
          continue;
        }
        attributes[key] = this.mutateAttributeForArray(key, attributes[key]);
      }
      return attributes;
    }

    /*Add the casted attributes to the attributes array.*/
    protected addCastAttributesToArray(attributes: any[], mutatedAttributes: any[]) {
      for (let [key, value] of Object.entries(this.getCasts())) {
        if (!array_key_exists(key, attributes) || in_array(key, mutatedAttributes)) {
          continue;
        }
        attributes[key] = this.castAttribute(key, attributes[key]);
        if (attributes[key] && (value === 'date' || value === 'datetime')) {
          attributes[key] = this.serializeDate(attributes[key]);
        }
        if (attributes[key] && this.isCustomDateTimeCast(value)) {
          attributes[key] = attributes[key].format(value.split(':')[1]);
        }
        if (attributes[key] && attributes[key] instanceof DateTimeInterface && this.isClassCastable(key)) {
          attributes[key] = this.serializeDate(attributes[key]);
        }
        if (attributes[key] instanceof Arrayable) {
          attributes[key] = attributes[key].toArray();
        }
      }
      return attributes;
    }

    /*Get an attribute array of all arrayable attributes.*/
    protected getArrayableAttributes() {
      return this.getArrayableItems(this.getAttributes());
    }

    /*Get all of the appendable values that are arrayable.*/
    protected getArrayableAppends() {
      if (!count(this.appends)) {
        return [];
      }
      return this.getArrayableItems(array_combine(this.appends, this.appends));
    }

    /*Get an attribute array of all arrayable relations.*/
    protected getArrayableRelations() {
      return this.getArrayableItems(this.relations);
    }

    /*Get an attribute array of all arrayable values.*/
    protected getArrayableItems(values: any[]) {
      if (count(this.getVisible()) > 0) {
        var values = array_intersect_key(values, array_flip(this.getVisible()));
      }
      if (count(this.getHidden()) > 0) {
        var values = array_diff_key(values, array_flip(this.getHidden()));
      }
      return values;
    }

    /*Get an attribute from the $attributes array.*/
    protected getAttributeFromArray(key: string) {
      return this.getAttributes()[key] ?? null;
    }

    /*Get a relationship value from a method.*/
    protected getRelationshipFromMethod(method: string) {
      var relation = this.method();
      if (!relation instanceof Relation) {
        if (isBlank(relation)) {
          throw new LogicException(`${HasAttributes}::${method} must return a relationship instance, but "null" was returned. Was the "return" keyword used?`);
        }
        throw new LogicException(`${HasAttributes}::${method} must return a relationship instance.`);
      }
      return tap(relation.getResults(), results => {
        this.setRelation(method, results);
      });
    }

    /*Get the value of an attribute using its mutator.*/
    protected mutateAttribute(key: string, value: any) {
      return this['get' + Str.studly(key) + 'Attribute'](value);
    }

    /*Get the value of an attribute using its mutator for array conversion.*/
    protected mutateAttributeForArray(key: string, value: any) {
      var value = this.isClassCastable(key) ? this.getClassCastableAttributeValue(key,
        value) : this.mutateAttribute(key, value);
      return value instanceof Arrayable ? value.toArray() : value;
    }

    /*Cast an attribute to a native PHP type.*/
    protected castAttribute(key: string, value: any) {
      var castType = this.getCastType(key);
      if (isBlank(value) && in_array(castType,
        (this.constructor as unknown as typeof HasAttributes).primitiveCastTypes)) {
        return value;
      }
      switch (castType) {
        case 'int':
        case 'integer':
          return;
          //cast type int
          value;
        case 'real':
        case 'float':
        case 'double':
          return this.fromFloat(value);
        case 'decimal':
          return this.asDecimal(value, this.getCasts()[key].split(':')[1]);
        case 'string':
          return;
          //cast type string
          value;
        case 'bool':
        case 'boolean':
          return;
          //cast type bool
          value;
        case 'object':
          return this.fromJson(value, true);
        case 'array':
        case 'json':
          return this.fromJson(value);
        case 'collection':
          return new BaseCollection(this.fromJson(value));
        case 'date':
          return this.asDate(value);
        case 'datetime':
        case 'custom_datetime':
          return this.asDateTime(value);
        case 'timestamp':
          return this.asTimestamp(value);
      }
      if (this.isClassCastable(key)) {
        return this.getClassCastableAttributeValue(key, value);
      }
      return value;
    }

    /*Cast the given attribute using a custom cast class.*/
    protected getClassCastableAttributeValue(key: string, value: any) {
      if (this.classCastCache[key] !== undefined) {
        return this.classCastCache[key];
      } else {
        var caster = this.resolveCasterClass(key);
        var value = caster instanceof CastsInboundAttributes ? value : caster.get(this, key, value, this.attributes);
        if (caster instanceof CastsInboundAttributes || !is_object(value)) {
          delete this.classCastCache[key];
        } else {
          this.classCastCache[key] = value;
        }
        return value;
      }
    }

    /*Get the type of cast for a model attribute.*/
    protected getCastType(key: string) {
      if (this.isCustomDateTimeCast(this.getCasts()[key])) {
        return 'custom_datetime';
      }
      if (this.isDecimalCast(this.getCasts()[key])) {
        return 'decimal';
      }
      return trim(this.getCasts()[key].toLowerCase());
    }

    /*Determine if the cast type is a custom date time cast.*/
    protected isCustomDateTimeCast(cast: string) {
      return strncmp(cast, 'date:', 5) === 0 || strncmp(cast, 'datetime:', 9) === 0;
    }

    /*Determine if the cast type is a decimal cast.*/
    protected isDecimalCast(cast: string) {
      return strncmp(cast, 'decimal:', 8) === 0;
    }

    /*Set the value of an attribute using its mutator.*/
    protected setMutatedAttributeValue(key: string, value: any) {
      return this['set' + Str.studly(key) + 'Attribute'](value);
    }

    /*Determine if the given attribute is a date or date castable.*/
    protected isDateAttribute(key: string) {
      return in_array(key, this.getDates(), true) || this.isDateCastable(key);
    }

    /*Set the value of a class castable attribute.*/
    protected setClassCastableAttribute(key: string, value: any) {
      var caster = this.resolveCasterClass(key);
      if (isBlank(value)) {
        this.attributes = [...this.attributes, ...array_map(() => {
        }, this.normalizeCastClassResponse(key, caster.set(this, key, this[key], this.attributes)))];
      } else {
        this.attributes = [...this.attributes, ...this.normalizeCastClassResponse(key,
          caster.set(this, key, value, this.attributes))];
      }
      if (caster instanceof CastsInboundAttributes || !is_object(value)) {
        delete this.classCastCache[key];
      } else {
        this.classCastCache[key] = value;
      }
    }

    /*Get an array attribute with the given key and value set.*/
    protected getArrayAttributeWithValue(path: string, key: string, value: any) {
      return tap(this.getArrayAttributeByKey(key), array => {
        Arr.set(array, str_replace('->', '.', path), value);
      });
    }

    /*Get an array attribute or return an empty array if it is not set.*/
    protected getArrayAttributeByKey(key: string) {
      return this.attributes[key] !== undefined ? this.fromJson(this.attributes[key]) : [];
    }

    /*Cast the given attribute to JSON.*/
    protected castAttributeAsJson(key: string, value: any) {
      var value = this.asJson(value);
      if (value === false) {
        throw JsonEncodingException.forAttribute(this, key, json_last_error_msg());
      }
      return value;
    }

    /*Encode the given value as JSON.*/
    protected asJson(value: any) {
      return json_encode(value);
    }

    /*Return a decimal as string.*/
    protected asDecimal(value: number, decimals: number) {
      return number_format(value, decimals, '.', '');
    }

    /*Return a timestamp as DateTime object with time set to 00:00:00.*/
    protected asDate(value: any) {
      return this.asDateTime(value).startOfDay();
    }

    /*Return a timestamp as DateTime object.*/
    protected asDateTime(value: any) {
      if (value instanceof CarbonInterface) {
        return Date.instance(value);
      }
      if (value instanceof DateTimeInterface) {
        return Date.parse(value.format('Y-m-d H:i:s.u'), value.getTimezone());
      }
      if (is_numeric(value)) {
        return Date.createFromTimestamp(value);
      }
      if (this.isStandardDateFormat(value)) {
        return Date.instance(Carbon.createFromFormat('Y-m-d', value).startOfDay());
      }
      var format = this.getDateFormat();
      if (Date.hasFormat(value, format)) {
        return Date.createFromFormat(format, value);
      }
      return Date.parse(value);
    }

    /*Determine if the given value is a standard date format.*/
    protected isStandardDateFormat(value: string) {
      return preg_match('/^(\\d{4})-(\\d{1,2})-(\\d{1,2})$/', value);
    }

    /*Return a timestamp as unix timestamp.*/
    protected asTimestamp(value: any) {
      return this.asDateTime(value).getTimestamp();
    }

    /*Prepare a date for array / JSON serialization.*/
    protected serializeDate(date: DateTimeInterface) {
      return Carbon.instance(date).toJSON();
    }

    /*Determine whether a value is Date / DateTime castable for inbound manipulation.*/
    protected isDateCastable(key: string) {
      return this.hasCast(key, ['date', 'datetime']);
    }

    /*Determine whether a value is JSON castable for inbound manipulation.*/
    protected isJsonCastable(key: string) {
      return this.hasCast(key, ['array', 'json', 'object', 'collection']);
    }

    /*Determine if the given key is cast using a custom class.*/
    protected isClassCastable(key: string) {
      return array_key_exists(key,
        this.getCasts()) && class_exists(clazz = this.parseCasterClass(this.getCasts()[key])) && !in_array(clazz,
        (this.constructor as unknown as typeof HasAttributes).primitiveCastTypes);
    }

    /*Resolve the custom caster class for a given key.*/
    protected resolveCasterClass(key: string) {
      var castType = this.getCasts()[key];
      var arguments = [];
      if (isString(castType) && strpos(castType, ':') !== false) {
        var segments = castType.split(':');
        var castType = segments[0];
        var arguments = segments[1].split(',');
      }
      if (is_subclass_of(castType, Castable)) {
        var castType = castType.castUsing();
      }
      if (is_object(castType)) {
        return castType;
      }
      return new castType(());
    }

    /*Parse the given caster class, removing any arguments.*/
    protected parseCasterClass(clazz: string) {
      return strpos(clazz, ':') === false ? clazz : clazz.split(':')[0];
    }

    /*Merge the cast class attributes back into the model.*/
    protected mergeAttributesFromClassCasts() {
      for (let [key, value] of Object.entries(this.classCastCache)) {
        var caster = this.resolveCasterClass(key);
        this.attributes = [...this.attributes, ...(caster instanceof CastsInboundAttributes ? {} : this.normalizeCastClassResponse(
          key,
          caster.set(this, key, value, this.attributes)))];
      }
    }

    /*Normalize the response from a custom class caster.*/
    protected normalizeCastClassResponse(key: string, value: any) {
      return isArray(value) ? value : {};
    }

    /*Get the model's original attribute values.*/
    protected getOriginalWithoutRewindingModel(key: string | null = null, _default: any = null) {
      if (key) {
        return this.transformModelValue(key, Arr.get(this.original, key, _default));
      }
      return collect(this.original).mapWithKeys((value, key: string | null) => {
        return {};
      }).all();
    }

    /*Determine if any of the given attributes were changed.*/
    protected hasChanges(changes: any[], attributes: any[] | string | null = null) {
      if (empty(attributes)) {
        return count(changes) > 0;
      }
      for (let attribute of Arr.wrap(attributes)) {
        if (array_key_exists(attribute, changes)) {
          return true;
        }
      }
      return false;
    }

    /*Transform a raw model value using mutators, casts, etc.*/
    protected transformModelValue(key: string, value: any) {
      if (this.hasGetMutator(key)) {
        return this.mutateAttribute(key, value);
      }
      if (this.hasCast(key)) {
        return this.castAttribute(key, value);
      }
      if (value !== null && in_array(key, this.getDates(), false))
      {
        return this.asDateTime(value);
      }
      return value;
    }
  };
}



