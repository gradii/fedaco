/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { isNumber } from '@gradii/check-type'
import { pascalCase } from '../helper/str'

export class Column {
  constructor(columnName, type, options = {}) {
    this._length = null

    this._precision = 10

    this._scale = 0

    this._unsigned = false

    this._fixed = false

    this._notnull = true

    this._default = null

    this._autoincrement = false

    this._platformOptions = {}

    this._columnDefinition = null

    this._comment = null

    this._customSchemaOptions = {}
    this.setName(columnName)
    this.setType(type)
    this.setOptions(options)
  }
  setName(name) {
    this._name = name
    return this
  }

  setOptions(options) {
    for (const [name, value] of Object.entries(options)) {
      const method = 'set' + pascalCase(name)
      if (method in this) {
        this[method](value)
      } else {
        throw new Error(`The "${name}" column option is not supported`)
      }
    }
    return this
  }

  setType(type) {
    this._type = type
    return this
  }

  setLength(length) {
    if (length !== null) {
      this._length = length
    } else {
      this._length = null
    }
    return this
  }

  setPrecision(precision) {
    if (!isNumber(precision)) {
      precision = 10
    }
    this._precision = +precision
    return this
  }

  setScale(scale) {
    if (!isNumber(scale)) {
      scale = 0
    }
    this._scale = +scale
    return this
  }

  setUnsigned(unsigned) {
    this._unsigned = Boolean(unsigned)
    return this
  }

  setFixed(fixed) {
    this._fixed = Boolean(fixed)
    return this
  }

  setNotnull(notnull) {
    this._notnull = Boolean(notnull)
    return this
  }

  setDefault(_default) {
    this._default = _default
    return this
  }

  setPlatformOptions(platformOptions) {
    this._platformOptions = platformOptions
    return this
  }

  setPlatformOption(name, value) {
    this._platformOptions[name] = value
    return this
  }

  setColumnDefinition(value) {
    this._columnDefinition = value
    return this
  }

  getType() {
    return this._type
  }

  getLength() {
    return this._length
  }

  getPrecision() {
    return this._precision
  }

  getScale() {
    return this._scale
  }

  getUnsigned() {
    return this._unsigned
  }

  getFixed() {
    return this._fixed
  }

  getNotnull() {
    return this._notnull
  }

  getDefault() {
    return this._default
  }

  getPlatformOptions() {
    return this._platformOptions
  }

  hasPlatformOption(name) {
    return this._platformOptions[name] !== undefined
  }

  getPlatformOption(name) {
    return this._platformOptions[name]
  }

  getColumnDefinition() {
    return this._columnDefinition
  }

  getAutoincrement() {
    return this._autoincrement
  }

  setAutoincrement(flag) {
    this._autoincrement = flag
    return this
  }

  setComment(comment) {
    this._comment = comment
    return this
  }

  getComment() {
    return this._comment
  }

  setCustomSchemaOption(name, value) {
    this._customSchemaOptions[name] = value
    return this
  }

  hasCustomSchemaOption(name) {
    return this._customSchemaOptions[name] !== undefined
  }

  getCustomSchemaOption(name) {
    return this._customSchemaOptions[name]
  }

  setCustomSchemaOptions(customSchemaOptions) {
    this._customSchemaOptions = customSchemaOptions
    return this
  }

  getCustomSchemaOptions() {
    return this._customSchemaOptions
  }
  getQuotedName(grammar) {
    return `"${this._name}"`
  }

  toArray() {
    return Object.assign(
      Object.assign(
        {
          name: this._name,
          type: this._type,
          default: this._default,
          notnull: this._notnull,
          length: this._length,
          precision: this._precision,
          scale: this._scale,
          fixed: this._fixed,
          unsigned: this._unsigned,
          autoincrement: this._autoincrement,
          columnDefinition: this._columnDefinition,
          comment: this._comment,
        },
        this._platformOptions
      ),
      this._customSchemaOptions
    )
  }
}
