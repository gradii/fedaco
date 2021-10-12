import { __awaiter } from 'tslib';
import { reflector } from '@gradii/annotation';
import { isArray, isBlank, isFunction, isNumber, isObjectEmpty, isString } from '@gradii/check-type';
import { format, getUnixTime, isValid, parse, startOfDay } from 'date-fns';
import { equals, findLast, omit, pick, tap, uniq } from 'ramda';
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
import { FedacoRelationColumn } from '../../annotation/relation-column';
import { wrap } from '../../helper/arr';
import { get, set } from '../../helper/obj';
import { snakeCase } from '../../helper/str';
import { Crypt } from '../encrypter';
import { Model } from '../model';
import { Relation } from '../relations/relation';

const EPSILON = 0.000001;

const PrimitiveCastTypes = [
  'array', 'bool', 'boolean', 'collection', 'custom_datetime', 'date', 'datetime', 'decimal',
  'double', 'encrypted', 'encrypted:array', 'encrypted:collection', 'encrypted:json',
  'encrypted:object', 'float', 'immutable_date', 'immutable_datetime',
  'immutable_custom_datetime', 'int', 'integer', 'json', 'object', 'real', 'string', 'timestamp'
];

export function mixinHasAttributes(base) {
  var _a;

  return _a = class _Self extends base {

    constructor(...args) {
      super(...args);

      this._attributes = {};

      this._original = {};

      this._changes = [];

      this._casts = {};

      this._classCastCache = [];

      this._dates = [];

      this._appends = [];
    }

    attributesToArray() {
      let attributes = this.getArrayableAttributes();
      attributes = this.addDateAttributesToArray(attributes);


      return attributes;
    }

    addDateAttributesToArray(attributes) {
      for (const key of this.getDates()) {
        if (attributes[key] == undefined) {
          continue;
        }
        attributes[key] = this.serializeDate(this.asDateTime(attributes[key]));
      }
      return attributes;
    }


    addCastAttributesToArray(attributes, mutatedAttributes) {
      for (const [key, value] of Object.entries(this.getCasts())) {
        if (!Object.keys(attributes).includes(key) || mutatedAttributes.includes(key)) {
          continue;
        }
        attributes[key] = this.castAttribute(key, attributes[key]);
        if (attributes[key] && [
          'date', 'datetime', 'immutable_date', 'immutable_datetime'
        ].includes(value)) {
          attributes[key] = this.serializeDate(attributes[key]);
        }
        if (attributes[key] && (this.isCustomDateTimeCast(value) ||
          this.isImmutableCustomDateTimeCast(value))) {
          attributes[key] = attributes[key].format(value.split(':')[1]);
        }
        if (attributes[key] && attributes[key] instanceof Date && this.isClassCastable(key)) {
          attributes[key] = this.serializeDate(attributes[key]);
        }


      }
      return attributes;
    }

    getArrayableAttributes() {
      return this.getArrayableItems(this.getAttributes());
    }

    getArrayableAppends() {
      if (!this._appends.length) {
        return [];
      }
      return this.getArrayableItems(this._appends);
    }

    relationsToArray() {
      let relation;
      const attributes = {};
      for (let [key, value] of Object.entries(this.getArrayableRelations())) {
        if (isArray(value)) {
          relation = value.map((it) => it.toArray());
        } else if (value instanceof Model) {
          relation = value.toArray();
        } else if (isBlank(value)) {
          relation = value;
        }
        if (this.constructor.snakeAttributes) {
          key = snakeCase(key);
        }
        attributes[key] = relation;
      }
      return attributes;
    }

    getArrayableRelations() {
      return this.getArrayableItems(this._relations);
    }

    getArrayableItems(values) {
      if (this.getVisible().length > 0) {
        values = pick(this.getVisible(), values);
      }
      if (this.getHidden().length > 0) {
        values = omit(this.getHidden(), values);
      }
      return values;
    }

    unsetAttribute(key) {
      delete this._attributes[key];
    }

    getAttribute(key) {
      if (!key) {
        return;
      }
      if (this._attributes.hasOwnProperty(key) ||


        this.isClassCastable(key)) {
        return this.getAttributeValue(key);
      }


      return this.getRelationValue(key);
    }

    getAttributeValue(key) {
      return this.transformModelValue(key, this._getAttributeFromArray(key));
    }

    _getAttributeFromArray(key) {
      var _a;
      return (_a = this.getAttributes()[key]) !== null && _a !== void 0 ? _a : null;
    }

    getRelationValue(key) {
      if (this.relationLoaded(key)) {
        return this._relations[key];
      }
      const relationMetadata = this.isRelation(key);
      if (!relationMetadata) {
        return;
      }


      return this.getRelationshipFromMethod(relationMetadata, key);
    }

    isRelation(key) {
      const metadata = this._columnInfo(key);
      const isRelation = metadata && (FedacoRelationColumn.isTypeOf(metadata));
      if (isRelation) {
        return metadata;
      }
      return undefined;


    }


    getRelationshipFromMethod(metadata, method) {
      return __awaiter(this, void 0, void 0, function* () {
        const relation = metadata._getRelation(this, method);
        if (!(relation instanceof Relation)) {
          if (isBlank(relation)) {
            throw new Error('LogicException(`${HasAttributes}::${method} must return a relationship instance, but "null" was returned. Was the "return" keyword used?`');
          }
          throw new Error('LogicException(`${HasAttributes}::${method} must return a relationship instance.`');
        }
        return tap(results => {
          this.setRelation(method, results);
        }, yield relation.getResults());
      });
    }


    castAttribute(key, value) {
      let castType = this.getCastType(key);
      if (isBlank(value) && PrimitiveCastTypes.includes(castType)) {
        return value;
      }
      if (this.isEncryptedCastable(key)) {
        value = this.fromEncryptedString(value);
        castType = castType.split('encrypted:').pop();
      }
      switch (castType) {
        case 'int':
        case 'integer':
          return value;
        case 'real':
        case 'float':
        case 'double':
          return this.fromFloat(value);
        case 'decimal':
          return this.asDecimal(value, +this.getCasts()[key].split(':')[1]);
        case 'string':
          return `${value}`;
        case 'bool':
        case 'boolean':
          return value && value !== 'false';
        case 'object':
          return this.fromJson(value);
        case 'array':
        case 'json':
          return this.fromJson(value);
        case 'collection':
          return this.fromJson(value);
        case 'date':
          return this.asDate(value);
        case 'datetime':
        case 'custom_datetime':
          return this.asDateTime(value);


        case 'timestamp':
          return this.asTimestamp(value);
      }


      return value;
    }


    getCastType(key) {


      if (this.isDecimalCast(this.getCasts()[key])) {
        return 'decimal';
      }
      return this.getCasts()[key].toLowerCase().trim();
    }


    isCustomDateTimeCast(cast) {
      const a = this._columnInfo(cast);
      return a && (a.isTypeof(DateColumn) || a.isTypeof(DatetimeColumn));

    }

    isImmutableCustomDateTimeCast(cast) {
      return cast.startsWith('immutable_date:') ||
        cast.startsWith('immutable_datetime:');
    }

    isDecimalCast(cast) {
      return cast.startsWith('decimal:');
    }

    setAttribute(key, value) {

      if (value && this.isDateAttribute(key)) {
        value = this.fromDateTime(value);
      }
      if (this.isClassCastable(key)) {
        this.setClassCastableAttribute(key, value);
        return this;
      }
      if (!isBlank(value) && this.isJsonCastable(key)) {
        value = this.castAttributeAsJson(key, value);
      }
      if (key.includes('->')) {
        return this.fillJsonAttribute(key, value);
      }
      if (!isBlank(value) && this.isEncryptedCastable(key)) {
        value = this.castAttributeAsEncryptedString(key, value);
      }
      this._attributes[key] = value;
      return this;
    }


    _columnInfo(key) {
      const typeOfClazz = this.constructor;
      const meta = reflector.propMetadata(typeOfClazz);
      if (meta[key] && isArray(meta[key])) {
        return findLast(it => {
          return FedacoColumn.isTypeOf(it) ||
            FedacoRelationColumn.isTypeOf(it);
        }, meta[key]);
      }
      return undefined;
    }

    isDateAttribute(key) {
      const a = this._columnInfo(key);
      return a && (a.isDate || a.isDateCastable) || this.isDateCastable(key);

    }

    fillJsonAttribute(key, value) {
      let path;
      [key, ...path] = key.split('->');
      value = this.asJson(this.getArrayAttributeWithValue(path.join('->'), key, value));
      this._attributes[key] = this.isEncryptedCastable(key) ?
        this.castAttributeAsEncryptedString(key, value) : value;
      return this;
    }

    setClassCastableAttribute(key, value) {

      this._attributes = [
        ...this._attributes
      ];


    }

    getArrayAttributeWithValue(path, key, value) {
      return tap(target => {
        set(target, path.replace('->', '.'), value);
      }, this.getArrayAttributeByKey(key));
    }

    getArrayAttributeByKey(key) {
      if (isBlank(this._attributes[key])) {
        return {};
      }

      return this.fromJson(this._attributes[key]);
    }

    castAttributeAsJson(key, value) {
      value = this.asJson(value);
      if (value == false) {
        throw new Error('JsonEncodingException.forAttribute(this, key, json_last_error_msg())');
      }
      return value;
    }

    asJson(value) {
      return JSON.stringify(value);
    }

    fromJson(value) {
      return JSON.parse(value);
    }


    castAttributeAsEncryptedString(key, value) {
      var _a;
      return ((_a = this.constructor.encrypter) !== null && _a !== void 0 ? _a : Crypt.getCryptor()).encrypt(value, false);
    }

    static encryptUsing(encrypter) {
      this.constructor.encrypter = encrypter;
    }

    fromFloat(value) {
      switch (value) {
        case 'Infinity':
          return Infinity;
        case '-Infinity':
          return -Infinity;
        case 'NaN':
          return NaN;
        default:
          return value;
      }
    }

    asDecimal(value, decimals) {
      return value.toFixed(decimals);
    }

    asDate(value) {
      return startOfDay(this.asDateTime(value));
    }

    asDateTime(value) {
      if (value instanceof Date) {
        return value;
      }
      if (isNumber(value)) {
        return new Date(value * 1000);
      }
      if (this.isStandardDateFormat(value)) {
        return parse(value, 'yyyy-MM-dd', new Date());
      }
      let date;
      try {
        date = parse(value, this.getDateFormat() || 'yyyy-MM-dd HH:mm:ss', new Date(value));
      } catch (e) {
      }
      return isValid(date) ? date : new Date(value);
    }

    isStandardDateFormat(value) {
      return /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
    }

    fromDateTime(value) {
      return isBlank(value) ?
        value :
        format(this.asDateTime(value), this.getDateFormat());
    }

    asTimestamp(value) {
      return getUnixTime(+this.asDateTime(value));
    }

    serializeDate(date) {
      return format(date, `yyyy-MM-dd HH:mm:ss`);
    }

    getDates() {
      if (!this.usesTimestamps()) {
        return this._dates;
      }
      const defaults = [this.getCreatedAtColumn(), this.getUpdatedAtColumn()];
      return uniq([...this._dates, ...defaults]);
    }

    getDateFormat() {
      return this._dateFormat || this.getConnection().getQueryGrammar().getDateFormat();
    }

    setDateFormat(format) {
      this._dateFormat = format;
      return this;
    }

    hasCast(key, types = null) {
      if (key in this.getCasts()) {
        return types ? types.includes(this.getCastType(key)) : true;
      }
      return false;
    }

    getCasts() {
      const typeOfClazz = this.constructor;
      const metas = reflector.propMetadata(typeOfClazz);
      const casts = {};
      for (const [key, meta] of Object.entries(metas)) {
        const columnMeta = findLast(it => {
          return FedacoColumn.isTypeOf(it);
        }, meta);
        switch (true) {
          case PrimaryColumn.isTypeOf(columnMeta):
            casts[key] = columnMeta.keyType || 'int';
            break;
          case PrimaryGeneratedColumn.isTypeOf(columnMeta):
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
            casts[key] = 'decimal';
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
            casts[key] = 'text';
            break;
          case TimestampColumn.isTypeOf(columnMeta):
            casts[key] = 'timestamp';
            break;
        }
      }
      return casts;
    }

    isDateCastable(key) {
      return this.hasCast(key, ['date', 'datetime', 'immutable_date', 'immutable_datetime']);
    }

    isJsonCastable(key) {
      return this.hasCast(key, [
        'array', 'json', 'object', 'collection', 'encrypted:array', 'encrypted:collection',
        'encrypted:json', 'encrypted:object'
      ]);
    }

    isEncryptedCastable(key) {
      return this.hasCast(key, [
        'encrypted', 'encrypted:array', 'encrypted:collection', 'encrypted:json', 'encrypted:object'
      ]);
    }

    isClassCastable(key) {
      if (!Object.keys(this.getCasts()).includes(key)) {
        return false;
      }
      const castType = this.getCasts()[key];
      if (isString(castType) && PrimitiveCastTypes.includes(castType)) {
        return false;
      }
      if (isFunction(castType)) {
        return true;
      }


      throw new Error(`InvalidCastException(this.getModel(), key, castType)`);
    }


    mergeAttributesFromClassCasts() {
      for (const [key, value] of Object.entries(this._classCastCache)) {

        this._attributes = Object.assign({}, this._attributes);
      }
    }

    normalizeCastClassResponse(key, value) {
      return isArray(value) ? value : {};
    }

    getAttributes() {
      this.mergeAttributesFromClassCasts();
      return this._attributes;
    }

    getAttributesForInsert() {
      return this.getAttributes();
    }

    setRawAttributes(attributes, sync = false) {
      this._attributes = attributes;
      if (sync) {
        this.syncOriginal();
      }
      this._classCastCache = [];
      return this;
    }

    getOriginal(key = null, _default = null) {

      return (new this.constructor())
        .setRawAttributes(this._original, true)
        .getOriginalWithoutRewindingModel(key, _default);
    }

    getOriginalWithoutRewindingModel(key = null, _default = null) {
      if (key) {
        return this.transformModelValue(key, get(this._original, key, _default));
      }
      const results = {};
      for (const [_key, value] of Object.entries(this._original)) {
        results[_key] = this.transformModelValue(_key, value);
      }
      return results;
    }

    getRawOriginal(key = null, _default = null) {
      return get(this._original, key, _default);
    }

    only(attributes) {
      const results = {};
      for (const attribute of isArray(attributes) ? attributes : arguments) {
        results[attribute] = this.getAttribute(attribute);
      }
      return results;
    }

    syncOriginal() {

      this._original = Object.assign({}, this.getAttributes());
      return this;
    }

    syncOriginalAttribute(attribute) {
      return this.syncOriginalAttributes(attribute);
    }

    syncOriginalAttributes(attributes) {
      attributes = isArray(attributes) ? attributes : arguments;
      const modelAttributes = this.getAttributes();
      for (const attribute of attributes) {
        this._original[attribute] = modelAttributes[attribute];
      }
      return this;
    }

    syncChanges() {
      this._changes = this.getDirty();
      return this;
    }

    isDirty(attributes = null) {
      return this.hasChanges(this.getDirty(), isArray(attributes) ? attributes : [...arguments]);
    }

    isClean(...attributes) {
      return !this.isDirty(...attributes);
    }

    wasChanged(attributes = null) {
      return this.hasChanges(this.getChanges(), isArray(attributes) ? attributes : [...arguments]);
    }

    hasChanges(changes, attributes = null) {
      if (!attributes.length) {
        return !isObjectEmpty(changes);
      }
      for (const attribute of wrap(attributes)) {
        if (attribute in changes) {
          return true;
        }
      }
      return false;
    }

    getDirty() {
      const dirty = {};
      for (const [key, value] of Object.entries(this.getAttributes())) {
        if (!this.originalIsEquivalent(key)) {
          dirty[key] = value;
        }
      }
      return dirty;
    }

    getChanges() {
      return this._changes;
    }

    originalIsEquivalent(key) {
      if (!(key in this._original)) {
        return false;
      }
      const attribute = get(this._attributes, key);
      const original = get(this._original, key);
      if (attribute === original) {
        return true;
      } else if (isBlank(attribute)) {
        return false;
      } else if (this.isDateAttribute(key)) {
        return this.fromDateTime(attribute) === this.fromDateTime(original);
      } else if (this.hasCast(key, ['object', 'collection'])) {
        return equals(this.castAttribute(key, attribute), this.castAttribute(key, original));
      } else if (this.hasCast(key, ['real', 'float', 'double'])) {
        if (attribute === null && original !== null || attribute !== null && original === null) {
          return false;
        }
        return Math.abs(this.castAttribute(key, attribute) - this.castAttribute(key, original)) < EPSILON * 4;
      } else if (this.hasCast(key, PrimitiveCastTypes)) {
        return this.castAttribute(key, attribute) === this.castAttribute(key, original);
      }
      return isNumber(attribute) &&
        isNumber(original) && attribute === original;
    }

    transformModelValue(key, value) {


      if (this.hasCast(key)) {
        return this.castAttribute(key, value);
      }
      if (value != null && this.getDates().includes(key)) {
        return this.asDateTime(value);
      }
      return value;
    }

    append(attributes) {
      this._appends = uniq([...this._appends, ...(isString(attributes) ? arguments : attributes)]);
      return this;
    }

    setAppends(appends) {
      this._appends = appends;
      return this;
    }

    hasAppended(attribute) {
      return attribute in this._appends;
    }
  },

    _a.snakeAttributes = true,

    _a.mutatorCache = [],
    _a;
}
