import { value } from '../helper/fn'
export class ColumnDefinition {
  constructor(attributes = {}) {
    this.attributes = attributes
  }

  get(key, defaultValue = null) {
    if (key in this.attributes) {
      return this.attributes[key]
    }
    return value(defaultValue)
  }
  set(key, val) {
    if (val !== undefined) {
      this.attributes[key] = val
    } else {
      this.attributes[key] = true
    }
    return this
  }

  get name() {
    return this.get('name')
  }
  get after() {
    return this.get('after')
  }
  get always() {
    return this.get('always')
  }
  get algorithm() {
    return this.get('algorithm')
  }
  get allowed() {
    return this.get('allowed')
  }
  get autoIncrement() {
    return this.get('autoIncrement')
  }
  get change() {
    return this.get('change')
  }
  get charset() {
    return this.get('charset')
  }
  get columns() {
    return this.get('columns')
  }
  get length() {
    return this.get('length')
  }
  get collation() {
    return this.get('collation')
  }
  get comment() {
    return this.get('comment')
  }
  get default() {
    return this.get('default')
  }
  get double() {
    return this.get('double')
  }
  get total() {
    return this.get('total')
  }
  get places() {
    return this.get('places')
  }
  get first() {
    return this.get('first')
  }
  get generatedAs() {
    return this.get('generatedAs')
  }
  get index() {
    return this.get('index')
  }
  get nullable() {
    return this.get('nullable')
  }
  get persisted() {
    return this.get('persisted')
  }
  get primary() {
    return this.get('primary')
  }
  get precision() {
    return this.get('precision')
  }
  get spatialIndex() {
    return this.get('spatialIndex')
  }
  get startingValue() {
    return this.get('startingValue')
  }
  get storedAs() {
    return this.get('storedAs')
  }
  get storedAsJson() {
    return this.get('storedAsJson')
  }
  get virtualAsJson() {
    return this.get('virtualAsJson')
  }
  get type() {
    return this.get('type')
  }
  get unique() {
    return this.get('unique')
  }
  get unsigned() {
    return this.get('unsigned')
  }
  get useCurrent() {
    return this.get('useCurrent')
  }
  get useCurrentOnUpdate() {
    return this.get('useCurrentOnUpdate')
  }
  get virtualAs() {
    return this.get('virtualAs')
  }
  get from() {
    return this.get('from')
  }
  get to() {
    return this.get('to')
  }
  get expression() {
    return this.get('expression')
  }
  get srid() {
    return this.get('srid')
  }
  get deferrable() {
    return this.get('deferrable')
  }
  get initiallyImmediate() {
    return this.get('initiallyImmediate')
  }
  get notValid() {
    return this.get('notValid')
  }
  get isGeometry() {
    return this.get('isGeometry')
  }
  get projection() {
    return this.get('projection')
  }

  getAttributes() {
    return this.attributes
  }

  toArray() {
    return this.attributes
  }

  toJson($options = 0) {
    return JSON.stringify(this.toArray())
  }
  isset(attributeName) {
    return attributeName in this.attributes
  }
  unset(attributeName) {
    delete this.attributes[attributeName]
  }

  withName(val) {
    this.attributes['name'] = val
    return this
  }

  withAfter(column) {
    this.attributes['after'] = column
    return this
  }

  withAlways() {
    this.attributes['always'] = true
    return this
  }
  withAlgorithm(val) {
    this.attributes['algorithm'] = val
    return this
  }
  withAllowed() {
    this.attributes['allowed'] = true
    return this
  }

  withAutoIncrement() {
    this.attributes['autoIncrement'] = true
    return this
  }

  withChange() {
    this.attributes['change'] = true
    return this
  }

  withCharset(charset) {
    this.attributes['charset'] = charset
    return this
  }
  withColumns(columns) {
    this.attributes['columns'] = columns
    return this
  }

  withLength(length) {
    this.attributes['length'] = length
    return this
  }

  withCollation(collation) {
    this.attributes['collation'] = collation
    return this
  }

  withComment(comment) {
    this.attributes['comment'] = comment
    return this
  }

  withDefault(val) {
    this.attributes['default'] = val
    return this
  }
  withDouble(val = true) {
    this.attributes['double'] = val
    return this
  }
  withTotal(val) {
    this.attributes['total'] = val
    return this
  }
  withPlaces(val) {
    this.attributes['places'] = val
    return this
  }

  withFirst() {
    this.attributes['first'] = true
    return this
  }

  withGeneratedAs(expression = true) {
    this.attributes['generatedAs'] = expression
    return this
  }

  withIndex(indexName = null) {
    this.attributes['index'] = indexName
    return this
  }

  withNullable(val = true) {
    this.attributes['nullable'] = val
    return this
  }

  withPersisted() {
    this.attributes['persisted'] = true
    return this
  }

  withPrimary() {
    this.attributes['primary'] = true
    return this
  }
  withPrecision() {
    this.attributes['precision'] = true
    return this
  }

  withSpatialIndex() {
    this.attributes['spatialIndex'] = true
    return this
  }

  withStartingValue(startingValue) {
    this.attributes['startingValue'] = startingValue
    return this
  }

  withStoredAs(expression) {
    this.attributes['storedAs'] = expression
    return this
  }
  withStoredAsJson(val) {
    this.attributes['storedAsJson'] = val
    return this
  }
  withVirtualAsJson(val) {
    this.attributes['virtualAsJson'] = val
    return this
  }

  withType(type) {
    this.attributes['type'] = type
    return this
  }

  withUnique(indexName = null) {
    this.attributes['unique'] = indexName
    return this
  }

  withUnsigned() {
    this.attributes['unsigned'] = true
    return this
  }

  withUseCurrent() {
    this.attributes['useCurrent'] = true
    return this
  }

  withUseCurrentOnUpdate() {
    this.attributes['useCurrentOnUpdate'] = true
    return this
  }

  withVirtualAs(expression) {
    this.attributes['virtualAs'] = expression
    return this
  }
  withFrom(val) {
    this.attributes['from'] = val
    return this
  }
  withTo(to) {
    this.attributes['to'] = to
    return this
  }
  withExpression(expression) {
    this.attributes['expression'] = expression
    return this
  }
  withSrid(srid) {
    this.attributes['srid'] = srid
    return this
  }
  withDeferrable() {
    this.attributes['deferrable'] = true
    return this
  }
  withInitiallyImmediate() {
    this.attributes['initiallyImmediate'] = true
    return this
  }
  withNotValid() {
    this.attributes['notValid'] = true
    return this
  }
  withIsGeometry() {
    this.attributes['isGeometry'] = true
    return this
  }
  withProjection() {
    this.attributes['projection'] = true
    return this
  }
}
