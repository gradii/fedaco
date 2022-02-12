/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { isArray, isBlank } from '@gradii/check-type'
import { Blueprint } from '../blueprint'
import { SchemaGrammar } from './schema-grammar'
export class SqlServerSchemaGrammar extends SchemaGrammar {
  constructor() {
    super(...arguments)

    this.transactions = true

    this.modifiers = [
      'Increment',
      'Collate',
      'Nullable',
      'Default',
      'Persisted',
    ]

    this.serials = [
      'tinyInteger',
      'smallInteger',
      'mediumInteger',
      'integer',
      'bigInteger',
    ]
  }

  compileCreateDatabase(name, connection) {
    return `create database ${this.wrapValue(name)}`
  }

  compileDropDatabaseIfExists(name) {
    return `drop database if exists ${this.wrapValue(name)}`
  }

  compileTableExists() {
    return "select * from sys.sysobjects where id = object_id(?) and xtype in ('U', 'V')"
  }

  compileColumnListing(table) {
    return '"select name from sys.columns where object_id = object_id(\'$table\')"'
  }

  compileCreate(blueprint, command) {
    const columns = this.getColumns(blueprint).join(', ')
    return `create table ` + `${this.wrapTable(blueprint)} (${columns})`
  }

  compileAdd(blueprint, command) {
    return (
      `alter table ` +
      `${this.wrapTable(blueprint)} add ${this.getColumns(blueprint).join(
        ', '
      )}`
    )
  }

  compilePrimary(blueprint, command) {
    return (
      `alter table ` +
      `${this.wrapTable(blueprint)} add constraint ${this.wrap(
        command.index
      )} primary key (${this.columnize(command.columns)})`
    )
  }

  compileUnique(blueprint, command) {
    return (
      `create unique index ` +
      `${this.wrap(command.index)} on ${this.wrapTable(
        blueprint
      )} (${this.columnize(command.columns)})`
    )
  }

  compileIndex(blueprint, command) {
    return (
      'create index ' +
      `${this.wrap(command.index)} on ${this.wrapTable(
        blueprint
      )} (${this.columnize(command.columns)})`
    )
  }

  compileSpatialIndex(blueprint, command) {
    return `create spatial index ${this.wrap(
      command.index
    )} on ${this.wrapTable(blueprint)} (${this.columnize(command.columns)})`
  }

  compileDrop(blueprint, command) {
    return 'drop table ' + this.wrapTable(blueprint)
  }

  compileDropIfExists(blueprint, command) {
    return `if exists (select * from sys.sysobjects where id = object_id(${`'${this.getTablePrefix()}${blueprint
      .getTable()
      .replace(`'`, `''`)}'`}, 'U')) drop table ${this.wrapTable(blueprint)}`
  }

  compileDropAllTables() {
    return `EXEC sp_msforeachtable 'DROP TABLE ?'`
  }

  compileDropColumn(blueprint, command) {
    const columns = this.wrapArray(command.columns)
    const dropExistingConstraintsSql =
      this.compileDropDefaultConstraint(blueprint, command) + ';'
    return (
      `${dropExistingConstraintsSql}` +
      `alter table ${this.wrapTable(blueprint)} drop column ${columns.join(
        ', '
      )}`
    )
  }

  compileDropDefaultConstraint(blueprint, command) {
    const columns = `'${command.columns.join("','")}'`
    const tableName = this.getTablePrefix() + blueprint.getTable()
    let sql = "DECLARE @sql NVARCHAR(MAX) = '';"
    sql += `SELECT @sql += 'ALTER TABLE [dbo].[${tableName}] DROP CONSTRAINT ' + OBJECT_NAME([default_object_id]) + ';' `
    sql += 'FROM SYS.COLUMNS '
    sql += `WHERE [object_id] = OBJECT_ID('[dbo].[${tableName}]') AND [name] in (${columns}) AND [default_object_id] <> 0;`
    sql += 'EXEC(@sql)'
    return sql
  }

  compileDropPrimary(blueprint, command) {
    const index = this.wrap(command.index)
    return `alter table ${this.wrapTable(blueprint)} drop constraint ${index}`
  }

  compileDropUnique(blueprint, command) {
    const index = this.wrap(command.index)
    return `drop ` + `index ${index} on ${this.wrapTable(blueprint)}`
  }

  compileDropIndex(blueprint, command) {
    const index = this.wrap(command.index)
    return `drop ` + `index ${index} on ${this.wrapTable(blueprint)}`
  }

  compileDropSpatialIndex(blueprint, command) {
    return this.compileDropIndex(blueprint, command)
  }

  compileDropForeign(blueprint, command) {
    const index = this.wrap(command.index)
    return (
      `alter table ` + `${this.wrapTable(blueprint)} drop constraint ${index}`
    )
  }

  compileRename(blueprint, command) {
    const from = this.wrapTable(blueprint)
    return `sp_rename ${from}, ${this.wrapTable(command.to)}`
  }

  compileRenameIndex(blueprint, command) {
    return `sp_rename N'${this.wrap(
      blueprint.getTable() + '.' + command.from
    )}', ${this.wrap(command.to)}, N'INDEX'`
  }

  compileEnableForeignKeyConstraints() {
    return 'EXEC sp_msforeachtable @command1="print \'?\'", @command2="ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all";'
  }

  compileDisableForeignKeyConstraints() {
    return 'EXEC sp_msforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";'
  }

  compileDropAllForeignKeys() {
    return `DECLARE @sql NVARCHAR(MAX) = N'';
    SELECT @sql += 'ALTER TABLE '
      + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' +
                   + QUOTENAME(OBJECT_NAME(parent_object_id))
      + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
    FROM sys.foreign_keys;

    EXEC sp_executesql @sql;`
  }

  compileDropAllViews() {
    return `DECLARE @sql NVARCHAR(MAX) = N'';
    SELECT @sql +=
           'DROP VIEW ' + QUOTENAME(OBJECT_SCHEMA_NAME(object_id)) + '.' + QUOTENAME(name) + ';'
    FROM sys.views;

    EXEC sp_executesql @sql;`
  }

  typeChar(column) {
    return `nchar(${column.length})`
  }

  typeString(column) {
    return `nvarchar(${column.length})`
  }

  typeTinyText(column) {
    return 'nvarchar(255)'
  }

  typeText(column) {
    return 'nvarchar(max)'
  }

  typeMediumText(column) {
    return 'nvarchar(max)'
  }

  typeLongText(column) {
    return 'nvarchar(max)'
  }

  typeInteger(column) {
    return 'int'
  }

  typeBigInteger(column) {
    return 'bigint'
  }

  typeMediumInteger(column) {
    return 'int'
  }

  typeTinyInteger(column) {
    return 'tinyint'
  }

  typeSmallInteger(column) {
    return 'smallint'
  }

  typeFloat(column) {
    return 'float'
  }

  typeDouble(column) {
    return 'float'
  }

  typeDecimal(column) {
    return `decimal(${column.total}, ${column.places})`
  }

  typeBoolean(column) {
    return 'bit'
  }

  typeEnum(column) {
    return `nvarchar(255) check ("${column.name}" in (${this.quoteString(
      column.allowed
    )}))`
  }

  typeJson(column) {
    return 'nvarchar(max)'
  }

  typeJsonb(column) {
    return 'nvarchar(max)'
  }

  typeDate(column) {
    return 'date'
  }

  typeDateTime(column) {
    return this.typeTimestamp(column)
  }

  typeDateTimeTz(column) {
    return this.typeTimestampTz(column)
  }

  typeTime(column) {
    return column.precision ? `time(${column.precision})` : 'time'
  }

  typeTimeTz(column) {
    return this.typeTime(column)
  }

  typeTimestamp(column) {
    const columnType = column.precision
      ? `datetime2(${column.precision})`
      : 'datetime'
    return column.useCurrent
      ? `${columnType} default CURRENT_TIMESTAMP`
      : columnType
  }

  typeTimestampTz(column) {
    const columnType = column.precision
      ? `datetimeoffset(${column.precision})`
      : 'datetimeoffset'
    return column.useCurrent
      ? `${columnType} default CURRENT_TIMESTAMP`
      : columnType
  }

  typeYear(column) {
    return this.typeInteger(column)
  }

  typeBinary(column) {
    return 'varbinary(max)'
  }

  typeUuid(column) {
    return 'uniqueidentifier'
  }

  typeIpAddress(column) {
    return 'nvarchar(45)'
  }

  typeMacAddress(column) {
    return 'nvarchar(17)'
  }

  typeGeometry(column) {
    return 'geography'
  }

  typePoint(column) {
    return 'geography'
  }

  typeLineString(column) {
    return 'geography'
  }

  typePolygon(column) {
    return 'geography'
  }

  typeGeometryCollection(column) {
    return 'geography'
  }

  typeMultiPoint(column) {
    return 'geography'
  }

  typeMultiLineString(column) {
    return 'geography'
  }

  typeMultiPolygon(column) {
    return 'geography'
  }

  typeComputed(column) {
    return `as (${column.expression})`
  }

  modifyCollate(blueprint, column) {
    if (!isBlank(column.collation)) {
      return ' collate ' + column.collation
    }
    return ''
  }

  modifyNullable(blueprint, column) {
    if (column.type !== 'computed') {
      return column.nullable ? ' null' : ' not null'
    }
    return ''
  }

  modifyDefault(blueprint, column) {
    if (!isBlank(column.default)) {
      return ' default ' + this.getDefaultValue(column.default)
    }
    return ''
  }

  modifyIncrement(blueprint, column) {
    if (this.serials.includes(column.type) && column.autoIncrement) {
      return ' identity primary key'
    }
    return ''
  }

  modifyPersisted(blueprint, column) {
    if (column.persisted) {
      return ' persisted'
    }
    return ''
  }

  wrapTable(table) {
    if (table instanceof Blueprint && table._temporary) {
      this.setTablePrefix('#')
    }
    return super.wrapTable(table)
  }

  quoteString(value) {
    if (isArray(value)) {
      return value.map((it) => this.quoteString(it)).join(', ')
    }
    return `N'${value}'`
  }
}
