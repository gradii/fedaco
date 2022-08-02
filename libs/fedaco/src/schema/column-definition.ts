/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { value } from '../helper/fn';
import type { SqlNode } from '../query/sql-node';

export type PostgresColumnDefineAttributes = {
  deferrable?: boolean
  initiallyImmediate?: boolean
  isGeometry?: boolean
  projection?: boolean
};

export type ColumnDefineAttributes = {
  name?: string,
  after?: string,
  always?: boolean,
  algorithm?: string,
  allowed?: boolean, // sql server
  autoIncrement?: boolean,
  change?: boolean,
  charset?: string,
  columns?: string[],
  length?: number,
  collation?: string,
  comment?: string,
  default?: string,
  double?: boolean,
  total?: number,
  places?: number,
  first?: boolean,
  generatedAs?: string | SqlNode | boolean,
  index?: string,
  nullable?: boolean,
  persisted?: boolean,
  primary?: boolean,
  precision?: boolean,
  spatialIndex?: boolean,
  startingValue?: number,
  storedAs?: string,
  storedAsJson?: string,
  virtualAsJson?: string,
  type?: string,
  unique?: string,
  unsigned?: boolean,
  useCurrent?: boolean,
  useCurrentOnUpdate?: boolean,
  virtualAs?: string,
  from?: string, // rename from
  to?: string, // rename to
  expression?: string,
  srid?: number,
  [key: string]: any
} & PostgresColumnDefineAttributes;

export class ColumnDefinition {

  constructor(public attributes: ColumnDefineAttributes = {}) {
  }

  /**
   * Get an attribute from the fluent instance.
   */
  public get(key: keyof ColumnDefineAttributes, defaultValue: any = null) {
    if (key in this.attributes) {
      return this.attributes[key];
    }

    return value(defaultValue);
  }

  public set(key: keyof ColumnDefineAttributes, val?: any) {
    if (val !== undefined) {
      this.attributes[key] = val;
    } else {
      this.attributes[key] = true;
    }

    return this;
  }

  // region get attribute
  public get name() {
    return this.get('name');
  }

  public get after() {
    return this.get('after');
  }

  public get always() {
    return this.get('always');
  }

  public get algorithm() {
    return this.get('algorithm');
  }

  public get allowed() {
    return this.get('allowed');
  }

  public get autoIncrement() {
    return this.get('autoIncrement');
  }

  public get change() {
    return this.get('change');
  }

  public get charset() {
    return this.get('charset');
  }

  public get columns() {
    return this.get('columns');
  }

  public get length() {
    return this.get('length');
  }

  public get collation() {
    return this.get('collation');
  }

  public get comment() {
    return this.get('comment');
  }

  public get default() {
    return this.get('default');
  }

  public get double() {
    return this.get('double');
  }

  public get total() {
    return this.get('total');
  }

  public get places() {
    return this.get('places');
  }

  public get first() {
    return this.get('first');
  }

  public get generatedAs() {
    return this.get('generatedAs');
  }

  public get index() {
    return this.get('index');
  }

  public get nullable() {
    return this.get('nullable');
  }

  public get persisted() {
    return this.get('persisted');
  }

  public get primary() {
    return this.get('primary');
  }

  public get precision() {
    return this.get('precision');
  }

  public get spatialIndex() {
    return this.get('spatialIndex');
  }

  public get startingValue() {
    return this.get('startingValue');
  }

  public get storedAs() {
    return this.get('storedAs');
  }

  public get storedAsJson() {
    return this.get('storedAsJson');
  }

  public get virtualAsJson() {
    return this.get('virtualAsJson');
  }

  public get type() {
    return this.get('type');
  }

  public get unique() {
    return this.get('unique');
  }

  public get unsigned() {
    return this.get('unsigned');
  }

  public get useCurrent() {
    return this.get('useCurrent');
  }

  public get useCurrentOnUpdate() {
    return this.get('useCurrentOnUpdate');
  }

  public get virtualAs() {
    return this.get('virtualAs');
  }

  public get from() {
    return this.get('from');
  }

  public get to() {
    return this.get('to');
  }

  public get expression() {
    return this.get('expression');
  }

  public get srid() {
    return this.get('srid');
  }

  public get deferrable() {
    return this.get('deferrable');
  }

  public get initiallyImmediate() {
    return this.get('initiallyImmediate');
  }

  public get notValid() {
    return this.get('notValid');
  }

  public get isGeometry() {
    return this.get('isGeometry');
  }

  public get projection() {
    return this.get('projection');
  }

  //endregion

  /**
   * Get the attributes from the fluent instance.
   */
  public getAttributes() {
    return this.attributes;
  }

  /**
   * Convert the fluent instance to an array.
   */
  public toArray() {
    return this.attributes;
  }

  /**
   * Convert the fluent instance to JSON.
   */
  public toJson($options = 0) {
    return JSON.stringify(this.toArray());
  }

  isset(attributeName: keyof ColumnDefineAttributes) {
    return attributeName in this.attributes;
  }

  unset(attributeName: keyof ColumnDefineAttributes) {
    delete this.attributes[attributeName];
  }

  // region setter

  withName(val: string) {
    this.attributes['name'] = val;
    return this;
  }

  /**
   * Place the column "after" another column (MySQL)
   * @param string
   */
  withAfter(column: string) {
    this.attributes['after'] = column;
    return this;
  }

  /**
   * Used as a modifier for generatedAs() (PostgreSQL)
   */
  withAlways() {
    this.attributes['always'] = true;
    return this;
  }

  withAlgorithm(val: string) {
    this.attributes['algorithm'] = val;
    return this;
  }

  withAllowed() {
    this.attributes['allowed'] = true;
    return this;
  }

  /**
   * Set INTEGER columns as auto-increment (primary key)
   */
  withAutoIncrement() {
    this.attributes['autoIncrement'] = true;
    return this;
  }

  /**
   * Change the column
   */
  withChange() {
    this.attributes['change'] = true;
    return this;
  }

  /**
   * Specify a character set for the column (MySQL)
   */
  withCharset(charset: string) {
    this.attributes['charset'] = charset;
    return this;
  }

  withColumns(columns: string[]) {
    this.attributes['columns'] = columns;
    return this;
  }

  /**
   * Specify a length for char int etc
   */
  withLength(length: number) {
    this.attributes['length'] = length;
    return this;
  }

  /**
   * Specify a collation for the column (MySQL/PostgreSQL/SQL Server)
   */
  withCollation(collation: string) {
    this.attributes['collation'] = collation;
    return this;
  }

  /**
   * Add a comment to the column (MySQL/PostgreSQL)
   * @param string
   */
  withComment(comment: string) {
    this.attributes['comment'] = comment;
    return this;
  }

  /**
   * Specify a "default" value for the column
   */
  withDefault(val: any) {
    this.attributes['default'] = val;
    return this;
  }

  withDouble(val: boolean = true) {
    this.attributes['double'] = val;
    return this;
  }

  withTotal(val: number) {
    this.attributes['total'] = val;
    return this;
  }

  withPlaces(val: any) {
    this.attributes['places'] = val;
    return this;
  }

  /**
   * Place the column "first" in the table (MySQL)
   */
  withFirst() {
    this.attributes['first'] = true;
    return this;
  }

  /**
   * Create a SQL compliant identity column (PostgreSQL)
   * @param string|SqlNode
   */
  withGeneratedAs(expression: string | SqlNode | boolean = true) {
    this.attributes['generatedAs'] = expression;
    return this;
  }

  /**
   * Add an index
   */
  withIndex(indexName: string = null) {
    this.attributes['index'] = indexName;
    return this;
  }

  /**
   * Allow NULL values to be inserted into the column
   */
  withNullable(val: boolean = true) {
    this.attributes['nullable'] = val;
    return this;
  }

  /**
   * Mark the computed generated column as persistent (SQL Server)
   */
  withPersisted() {
    this.attributes['persisted'] = true;
    return this;
  }

  /**
   * Add a primary index
   */
  withPrimary() {
    this.attributes['primary'] = true;
    return this;
  }

  withPrecision() {
    this.attributes['precision'] = true;
    return this;
  }

  /**
   * Add a spatial index
   */
  withSpatialIndex() {
    this.attributes['spatialIndex'] = true;
    return this;
  }

  /**
   * Set the starting value of an auto-incrementing field (MySQL/PostgreSQL)
   */
  withStartingValue(startingValue: number) {
    this.attributes['startingValue'] = startingValue;
    return this;
  }

  /**
   * Create a stored generated column (MySQL/PostgreSQL/SQLite)
   */
  withStoredAs(expression: string) {
    this.attributes['storedAs'] = expression;
    return this;
  }

  withStoredAsJson(val: string) {
    this.attributes['storedAsJson'] = val;
    return this;
  }

  withVirtualAsJson(val: string) {
    this.attributes['virtualAsJson'] = val;
    return this;
  }

  /**
   * Specify a type for the column
   */
  withType(type: string) {
    this.attributes['type'] = type;
    return this;
  }

  /**
   * Add a unique index
   */
  withUnique(indexName: string = null) {
    this.attributes['unique'] = indexName;
    return this;
  }

  /**
   * Set the INTEGER column as UNSIGNED (MySQL)
   */
  withUnsigned() {
    this.attributes['unsigned'] = true;
    return this;
  }

  /**
   * Set the TIMESTAMP column to use CURRENT_TIMESTAMP as default value
   */
  withUseCurrent() {
    this.attributes['useCurrent'] = true;
    return this;
  }

  /**
   * Set the TIMESTAMP column to use CURRENT_TIMESTAMP when updating (MySQL)
   */
  withUseCurrentOnUpdate() {
    this.attributes['useCurrentOnUpdate'] = true;
    return this;
  }

  /**
   * Create a virtual generated column (MySQL/PostgreSQL/SQLite)
   */
  withVirtualAs(expression: string) {
    this.attributes['virtualAs'] = expression;
    return this;
  }

  withFrom(val: string) {
    this.attributes['from'] = val;
    return this;
  }

  withTo(to: string) {
    this.attributes['to'] = to;
    return this;
  }

  withExpression(expression: string) {
    this.attributes['expression'] = expression;
    return this;
  }

  withSrid(srid: number) {
    this.attributes['srid'] = srid;
    return this;
  }

  withDeferrable() {
    this.attributes['deferrable'] = true;
    return this;
  }

  withInitiallyImmediate() {
    this.attributes['initiallyImmediate'] = true;
    return this;
  }

  withNotValid() {
    this.attributes['notValid'] = true;
    return this;
  }

  withIsGeometry() {
    this.attributes['isGeometry'] = true;
    return this;
  }

  withProjection() {
    this.attributes['projection'] = true;
    return this;
  }

  //endregion
}
