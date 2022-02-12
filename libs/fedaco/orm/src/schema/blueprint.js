import { __awaiter } from 'tslib'

import { has, isAnyEmpty, isArray, isBlank, isString } from '@gradii/check-type'
import { wrap } from '../helper/arr'
import { lowerCaseFirst, upperCaseFirst } from '../helper/str'
import { raw } from '../query-builder/ast-factory'
import { ColumnDefinition } from './column-definition'
import { ForeignIdColumnDefinition } from './foreign-id-column-definition'
import { ForeignKeyDefinition } from './foreign-key-definition'
import { SchemaBuilder } from './schema-builder'
export class Blueprint {
  constructor(table, callback = null, prefix = '') {
    this.columns = []

    this.commands = []

    this._temporary = false
    this.table = table
    this.prefix = prefix
    if (!isBlank(callback)) {
      callback(this)
    }
  }

  build(connection, grammar) {
    return __awaiter(this, void 0, void 0, function* () {
      for (const statement of yield this.toSql(connection, grammar)) {
        yield connection.statement(statement)
      }
    })
  }

  toSql(connection, grammar) {
    this.addImpliedCommands(grammar)
    let statements = []
    this.ensureCommandsAreValid(connection)
    for (const command of this.commands) {
      const method = 'compile' + upperCaseFirst(command.name)
      if (method in grammar) {
        const sql = grammar[method](this, command, connection)
        if (isArray(sql) && sql.length > 0) {
          statements = [...statements, ...sql]
        } else if (isString(sql) && sql.length > 0) {
          statements.push(sql)
        }
      } else {
        throw new Error(
          `command name ${command.name} is not exist in grammar ${grammar.constructor.name}`
        )
      }
    }
    return statements
  }

  ensureCommandsAreValid(connection) {}

  commandsNamed(names) {
    return this.commands.filter((command) => {
      return command.name in names
    })
  }

  addImpliedCommands(grammar) {
    if (this.getAddedColumns().length > 0 && !this.creating()) {
      this.commands.unshift(this.createCommand('add'))
    }
    if (this.getChangedColumns().length > 0 && !this.creating()) {
      this.commands.unshift(this.createCommand('change'))
    }
    this.addFluentIndexes()
    this.addFluentCommands(grammar)
  }

  addFluentIndexes() {
    for (const column of this.columns) {
      for (const index of ['primary', 'unique', 'index', 'spatialIndex']) {
        if (column.get(index) === true) {
          this[index]([column.name])
          column.set(index, false)
          break
        } else if (has(column, index)) {
          this[index]([column.name], column.get(index))
          column.set(index, false)
          break
        }
      }
    }
  }

  addFluentCommands(grammar) {
    for (const column of this.columns) {
      for (const commandName of grammar.getFluentCommands()) {
        const attributeName = lowerCaseFirst(commandName)
        if (!column.isset(attributeName)) {
          continue
        }
        const value = column.get(attributeName)
        this.addCommand(commandName, { value, column })
      }
    }
  }

  creating() {
    return this.commands.find((command) => {
      return command.name === 'create'
    })
  }

  create() {
    return this.addCommand('create')
  }

  temporary() {
    this._temporary = true
  }

  drop() {
    return this.addCommand('drop')
  }

  dropIfExists() {
    return this.addCommand('dropIfExists')
  }

  dropColumn(columns, ...args) {
    columns = isArray(columns) ? columns : [columns, ...args]
    return this.addCommand('dropColumn', { columns })
  }

  renameColumn(from, to) {
    return this.addCommand('renameColumn', { from, to })
  }

  dropPrimary(index = null) {
    return this.dropIndexCommand('dropPrimary', 'primary', index)
  }

  dropUnique(index) {
    return this.dropIndexCommand('dropUnique', 'unique', index)
  }

  dropIndex(index) {
    return this.dropIndexCommand('dropIndex', 'index', index)
  }

  dropSpatialIndex(index) {
    return this.dropIndexCommand('dropSpatialIndex', 'spatialIndex', index)
  }

  dropForeign(index) {
    return this.dropIndexCommand('dropForeign', 'foreign', index)
  }

  dropConstrainedForeignId(column) {
    this.dropForeign([column])
    return this.dropColumn(column)
  }

  renameIndex(from, to) {
    return this.addCommand('renameIndex', { from, to })
  }

  dropTimestamps() {
    this.dropColumn('created_at', 'updated_at')
  }

  dropTimestampsTz() {
    this.dropTimestamps()
  }

  dropSoftDeletes(column = 'deleted_at') {
    this.dropColumn(column)
  }

  dropSoftDeletesTz(column = 'deleted_at') {
    this.dropSoftDeletes(column)
  }

  dropRememberToken() {
    this.dropColumn('remember_token')
  }

  dropMorphs(name, indexName = null) {
    this.dropIndex(
      indexName || this.createIndexName('index', [`${name}_type`, `${name}_id`])
    )
    this.dropColumn(`${name}_type`, `${name}_id`)
  }

  rename(to) {
    return this.addCommand('rename', { to })
  }

  primary(columns, name = null, algorithm = null) {
    return this.indexCommand('primary', columns, name, algorithm)
  }

  unique(columns, name = null, algorithm = null) {
    return this.indexCommand('unique', columns, name, algorithm)
  }

  index(columns, name = null, algorithm = null) {
    return this.indexCommand('index', columns, name, algorithm)
  }

  spatialIndex(columns, name = null) {
    return this.indexCommand('spatialIndex', columns, name)
  }

  rawIndex(expression, name) {
    return this.index([raw(expression)], name)
  }

  foreign(columns, name = null) {
    const command = new ForeignKeyDefinition(
      this.indexCommand('foreign', columns, name).getAttributes()
    )
    this.commands[this.commands.length - 1] = command
    return command
  }

  id(column = 'id') {
    return this.bigIncrements(column)
  }

  increments(column) {
    return this.unsignedInteger(column, true)
  }

  integerIncrements(column) {
    return this.unsignedInteger(column, true)
  }

  tinyIncrements(column) {
    return this.unsignedTinyInteger(column, true)
  }

  smallIncrements(column) {
    return this.unsignedSmallInteger(column, true)
  }

  mediumIncrements(column) {
    return this.unsignedMediumInteger(column, true)
  }

  bigIncrements(column) {
    return this.unsignedBigInteger(column, true)
  }

  char(column, length = null) {
    length = length || SchemaBuilder._defaultStringLength
    return this.addColumn('char', column, { length })
  }

  string(column, length = null) {
    length = length || SchemaBuilder._defaultStringLength
    return this.addColumn('string', column, { length })
  }

  tinyText(column) {
    return this.addColumn('tinyText', column)
  }

  text(column) {
    return this.addColumn('text', column)
  }

  mediumText(column) {
    return this.addColumn('mediumText', column)
  }

  longText(column) {
    return this.addColumn('longText', column)
  }

  integer(column, autoIncrement = false, unsigned = false) {
    return this.addColumn('integer', column, { autoIncrement, unsigned })
  }

  tinyInteger(column, autoIncrement = false, unsigned = false) {
    return this.addColumn('tinyInteger', column, { autoIncrement, unsigned })
  }

  smallInteger(column, autoIncrement = false, unsigned = false) {
    return this.addColumn('smallInteger', column, { autoIncrement, unsigned })
  }

  mediumInteger(column, autoIncrement = false, unsigned = false) {
    return this.addColumn('mediumInteger', column, { autoIncrement, unsigned })
  }

  bigInteger(column, autoIncrement = false, unsigned = false) {
    return this.addColumn('bigInteger', column, { autoIncrement, unsigned })
  }

  unsignedInteger(column, autoIncrement = false) {
    return this.integer(column, autoIncrement, true)
  }

  unsignedTinyInteger(column, autoIncrement = false) {
    return this.tinyInteger(column, autoIncrement, true)
  }

  unsignedSmallInteger(column, autoIncrement = false) {
    return this.smallInteger(column, autoIncrement, true)
  }

  unsignedMediumInteger(column, autoIncrement = false) {
    return this.mediumInteger(column, autoIncrement, true)
  }

  unsignedBigInteger(column, autoIncrement = false) {
    return this.bigInteger(column, autoIncrement, true)
  }

  foreignId(column) {
    return this.addColumnDefinition(
      new ForeignIdColumnDefinition(this, {
        type: 'bigInteger',
        name: column,
        autoIncrement: false,
        unsigned: true,
      })
    )
  }

  foreignIdFor(model, column = null) {
    return model.getKeyType() === 'int' && model.getIncrementing()
      ? this.foreignId(column || model.getForeignKey())
      : this.foreignUuid(column || model.getForeignKey())
  }

  float(column, total = 8, places = 2, unsigned = false) {
    return this.addColumn('float', column, { total, places, unsigned })
  }

  double(column, total = null, places = null, unsigned = false) {
    return this.addColumn('double', column, { total, places, unsigned })
  }

  decimal(column, total = 8, places = 2, unsigned = false) {
    return this.addColumn('decimal', column, { total, places, unsigned })
  }

  unsignedFloat(column, total = 8, places = 2) {
    return this.float(column, total, places, true)
  }

  unsignedDouble(column, total = null, places = null) {
    return this.double(column, total, places, true)
  }

  unsignedDecimal(column, total = 8, places = 2) {
    return this.decimal(column, total, places, true)
  }

  boolean(column) {
    return this.addColumn('boolean', column)
  }

  enum(column, allowed) {
    return this.addColumn('enum', column, { allowed })
  }

  set(column, allowed) {
    return this.addColumn('set', column, { allowed })
  }

  json(column) {
    return this.addColumn('json', column)
  }

  jsonb(column) {
    return this.addColumn('jsonb', column)
  }

  date(column) {
    return this.addColumn('date', column)
  }

  dateTime(column, precision = 0) {
    return this.addColumn('dateTime', column, { precision })
  }

  dateTimeTz(column, precision = 0) {
    return this.addColumn('dateTimeTz', column, { precision })
  }

  time(column, precision = 0) {
    return this.addColumn('time', column, { precision })
  }

  timeTz(column, precision = 0) {
    return this.addColumn('timeTz', column, { precision })
  }

  timestamp(column, precision = 0) {
    return this.addColumn('timestamp', column, { precision })
  }

  timestampTz(column, precision = 0) {
    return this.addColumn('timestampTz', column, { precision })
  }

  timestamps(precision = 0) {
    this.timestamp('created_at', precision).withNullable()
    this.timestamp('updated_at', precision).withNullable()
  }

  nullableTimestamps(precision = 0) {
    this.timestamps(precision)
  }

  timestampsTz(precision = 0) {
    this.timestampTz('created_at', precision).withNullable()
    this.timestampTz('updated_at', precision).withNullable()
  }

  softDeletes(column = 'deleted_at', precision = 0) {
    return this.timestamp(column, precision).withNullable()
  }

  softDeletesTz(column = 'deleted_at', precision = 0) {
    return this.timestampTz(column, precision).withNullable()
  }

  year(column) {
    return this.addColumn('year', column)
  }

  binary(column) {
    return this.addColumn('binary', column)
  }

  uuid(column = 'uuid') {
    return this.addColumn('uuid', column)
  }

  foreignUuid(column) {
    return this.addColumnDefinition(
      new ForeignIdColumnDefinition(this, {
        type: 'uuid',
        name: column,
      })
    )
  }

  ipAddress(column = 'ip_address') {
    return this.addColumn('ipAddress', column)
  }

  macAddress(column = 'mac_address') {
    return this.addColumn('macAddress', column)
  }

  geometry(column) {
    return this.addColumn('geometry', column)
  }

  point(column, srid = null) {
    return this.addColumn('point', column, { srid })
  }

  lineString(column) {
    return this.addColumn('lineString', column)
  }

  polygon(column) {
    return this.addColumn('polygon', column)
  }

  geometryCollection(column) {
    return this.addColumn('geometryCollection', column)
  }

  multiPoint(column) {
    return this.addColumn('multiPoint', column)
  }

  multiLineString(column) {
    return this.addColumn('multiLineString', column)
  }

  multiPolygon(column) {
    return this.addColumn('multiPolygon', column)
  }

  multiPolygonZ(column) {
    return this.addColumn('multiPolygonZ', column)
  }

  computed(column, expression) {
    return this.addColumn('computed', column, { expression })
  }

  morphs(name, indexName = null) {
    if (SchemaBuilder._defaultMorphKeyType === 'uuid') {
      this.uuidMorphs(name, indexName)
    } else {
      this.numericMorphs(name, indexName)
    }
  }

  nullableMorphs(name, indexName = null) {
    if (SchemaBuilder._defaultMorphKeyType === 'uuid') {
      this.nullableUuidMorphs(name, indexName)
    } else {
      this.nullableNumericMorphs(name, indexName)
    }
  }

  numericMorphs(name, indexName = null) {
    this.string(`${name}_type`)
    this.unsignedBigInteger(`${name}_id`)
    this.index([`${name}_type`, `${name}_id`], indexName)
  }

  nullableNumericMorphs(name, indexName = null) {
    this.string(`${name}_type`).withNullable()
    this.unsignedBigInteger(`${name}_id`).withNullable()
    this.index([`${name}_type`, `${name}_id`], indexName)
  }

  uuidMorphs(name, indexName = null) {
    this.string(`${name}_type`)
    this.uuid(`${name}_id`)
    this.index([`${name}_type`, `${name}_id`], indexName)
  }

  nullableUuidMorphs(name, indexName = null) {
    this.string(`${name}_type`).withNullable()
    this.uuid(`${name}_id`).withNullable()
    this.index([`${name}_type`, `${name}_id`], indexName)
  }

  rememberToken() {
    return this.string('remember_token', 100).withNullable()
  }

  indexCommand(type, columns, index, algorithm = null) {
    columns = wrap(columns)
    index = index || this.createIndexName(type, columns)
    return this.addCommand(type, { index, columns, algorithm })
  }

  dropIndexCommand(command, type, index) {
    let columns = []
    if (isArray(index)) {
      index = this.createIndexName(type, (columns = index))
    }
    return this.indexCommand(command, columns, index)
  }

  createIndexName(type, columns) {
    const index = (
      this.prefix +
      this.table +
      '_' +
      columns.join('_') +
      '_' +
      type
    ).toLowerCase()
    return index.replace(/[-.]/g, '_')
  }

  addColumn(type, name, parameters = {}) {
    return this.addColumnDefinition(
      new ColumnDefinition(Object.assign({ type, name }, parameters))
    )
  }

  addColumnDefinition(definition) {
    this.columns.push(definition)
    if (this._after) {
      definition.after(this._after)
      this._after = definition.name
    }
    return definition
  }

  after(column, callback) {
    this._after = column
    callback(this)
    this._after = null
  }

  removeColumn(name) {
    this.columns = this.columns.filter((c) => {
      return c['name'] != name
    })
    return this
  }

  addCommand(name, parameters = {}) {
    const command = this.createCommand(name, parameters)
    this.commands.push(command)
    return command
  }

  createCommand(name, parameters = {}) {
    return new ColumnDefinition(Object.assign({ name }, parameters))
  }

  getTable() {
    return this.table
  }

  getColumns() {
    return this.columns
  }

  getCommands() {
    return this.commands
  }

  getAddedColumns() {
    return this.columns.filter((column) => {
      return !column.change
    })
  }

  getChangedColumns() {
    return this.columns.filter((column) => {
      return column.change
    })
  }

  hasAutoIncrementColumn() {
    return !isBlank(
      this.getAddedColumns().find((column) => {
        return column.autoIncrement === true
      })
    )
  }

  autoIncrementingStartingValues() {
    if (!this.hasAutoIncrementColumn()) {
      return []
    }
    return this.getAddedColumns()
      .map((column) => {
        return column.autoIncrement === true
          ? column.get('startingValue', column.get('from'))
          : null
      })
      .filter((it) => !isAnyEmpty(it))
  }
}
