/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray, isBlank } from '@gradii/nanofn';
import type { Connection } from '../../connection';
import { Blueprint } from '../blueprint';
import type { ColumnDefinition } from '../column-definition';
import { SchemaGrammar } from './schema-grammar';

export class SqlServerSchemaGrammar extends SchemaGrammar {
  /*If this Grammar supports schema changes wrapped in a transaction.*/
  protected transactions = true;
  /*The possible column modifiers.*/
  protected modifiers: string[] = ['Increment', 'Collate', 'Nullable', 'Default', 'Persisted'];
  /*The columns available as serials.*/
  protected serials: string[] = [
    'tinyInteger', 'smallInteger', 'mediumInteger', 'integer', 'bigInteger'
  ];

  /*Compile a create database command.*/
  public compileCreateDatabase(name: string, connection: Connection) {
    return `create database ${this.wrapValue(name)}`;
  }

  /*Compile a drop database if exists command.*/
  public compileDropDatabaseIfExists(name: string) {
    return `drop database if exists ${this.wrapValue(name)}`;
  }

  /*Compile the query to determine if a table exists.*/
  public compileTableExists() {
    return 'select * from sys.sysobjects where id = object_id(?) and xtype in (\'U\', \'V\')';
  }

  /*Compile the query to determine the list of columns.*/
  public compileColumnListing(table: string) {
    return '"select name from sys.columns where object_id = object_id(\'Table\')"';
  }

  /*Compile a create table command.*/
  public compileCreate(blueprint: Blueprint, command: ColumnDefinition) {
    const columns = this.getColumns(blueprint).join(', ');
    return `create table ` + `${this.wrapTable(blueprint)} (${columns})`;
  }

  /*Compile a column addition table command.*/
  public compileAdd(blueprint: Blueprint, command: ColumnDefinition) {
    // language=SQL format=false
    return `alter table ` + `${this.wrapTable(blueprint)} add ${
      this.getColumns(blueprint).join(', ')
    }`;
  }

  /*Compile a primary key command.*/
  public compilePrimary(blueprint: Blueprint, command: ColumnDefinition) {
    // language=SQL format=false
    return `alter table ` + `${this.wrapTable(blueprint)} add constraint ${
      this.wrap(command.index)
    } primary key (${this.columnize(command.columns)})`;
  }

  /*Compile a unique key command.*/
  public compileUnique(blueprint: Blueprint, command: ColumnDefinition) {
    // language=SQL format=false
    return `create unique index ` + `${this.wrap(command.index)} on ${
      this.wrapTable(blueprint)
    } (${this.columnize(command.columns)})`;
  }

  /*Compile a plain index key command.*/
  public compileIndex(blueprint: Blueprint, command: ColumnDefinition) {
    // language=SQL format=false
    return 'create index ' + `${this.wrap(command.index)} on ${this.wrapTable(
      blueprint)} (${this.columnize(command.columns)})`;
  }

  /*Compile a spatial index key command.*/
  public compileSpatialIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return `create spatial index ${this.wrap(command.index)} on ${this.wrapTable(
      blueprint)} (${this.columnize(command.columns)})`;
  }

  /*Compile a drop table command.*/
  public compileDrop(blueprint: Blueprint, command: ColumnDefinition) {
    return 'drop table ' + this.wrapTable(blueprint);
  }

  /*Compile a drop table (if exists) command.*/
  public compileDropIfExists(blueprint: Blueprint, command: ColumnDefinition) {
    return `if exists (select * from sys.sysobjects where id = object_id(${
      `'${this.getTablePrefix()}${blueprint.getTable().replace(`'`, `''`)}'`
    }, 'U')) drop table ${this.wrapTable(blueprint)}`;
  }

  /*Compile the SQL needed to drop all tables.*/
  public compileDropAllTables() {
    return `EXEC sp_msforeachtable 'DROP TABLE ?'`;
  }

  /*Compile a drop column command.*/
  public compileDropColumn(blueprint: Blueprint, command: ColumnDefinition) {
    const columns                    = this.wrapArray(command.columns);
    const dropExistingConstraintsSql = this.compileDropDefaultConstraint(blueprint, command) + ';';
    return `${dropExistingConstraintsSql}` + `alter table ${this.wrapTable(
      blueprint)} drop column ${columns.join(', ')}`;
  }

  /*Compile a drop default constraint command.*/
  public compileDropDefaultConstraint(blueprint: Blueprint, command: ColumnDefinition) {
    const columns   = `'${command.columns.join('\',\'')}'`;
    const tableName = this.getTablePrefix() + blueprint.getTable();
    let sql         = 'DECLARE @sql NVARCHAR(MAX) = \'\';';
    sql += `SELECT @sql += 'ALTER TABLE [dbo].[${tableName}] DROP CONSTRAINT ' + OBJECT_NAME([default_object_id]) + ';' `;
    sql += 'FROM SYS.COLUMNS ';
    sql += `WHERE [object_id] = OBJECT_ID('[dbo].[${tableName}]') AND [name] in (${columns}) AND [default_object_id] <> 0;`;
    sql += 'EXEC(@sql)';
    return sql;
  }

  /*Compile a drop primary key command.*/
  public compileDropPrimary(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return `alter table ${this.wrapTable(blueprint)} drop constraint ${index}`;
  }

  /*Compile a drop unique key command.*/
  public compileDropUnique(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return `drop ` + `index ${index} on ${this.wrapTable(blueprint)}`;
  }

  /*Compile a drop index command.*/
  public compileDropIndex(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return `drop ` + `index ${index} on ${this.wrapTable(blueprint)}`;
  }

  /*Compile a drop spatial index command.*/
  public compileDropSpatialIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return this.compileDropIndex(blueprint, command);
  }

  /*Compile a drop foreign key command.*/
  public compileDropForeign(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return `alter table ` + `${this.wrapTable(blueprint)} drop constraint ${index}`;
  }

  /*Compile a rename table command.*/
  public compileRename(blueprint: Blueprint, command: ColumnDefinition) {
    const from = this.wrapTable(blueprint);
    return `sp_rename ${from}, ${this.wrapTable(command.to)}`;
  }

  /*Compile a rename index command.*/
  public compileRenameIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return `sp_rename N'${this.wrap(blueprint.getTable() + '.' + command.from)}', ${this.wrap(
      command.to)}, N'INDEX'`;
  }

  /*Compile the command to enable foreign key constraints.*/
  public compileEnableForeignKeyConstraints() {
    return 'EXEC sp_msforeachtable @command1="print \'?\'", @command2="ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all";';
  }

  /*Compile the command to disable foreign key constraints.*/
  public compileDisableForeignKeyConstraints() {
    return 'EXEC sp_msforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";';
  }

  /*Compile the command to drop all foreign keys.*/
  public compileDropAllForeignKeys() {
    return `DECLARE @sql NVARCHAR(MAX) = N'';
    SELECT @sql += 'ALTER TABLE '
      + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' +
                   + QUOTENAME(OBJECT_NAME(parent_object_id))
      + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
    FROM sys.foreign_keys;

    EXEC sp_executesql @sql;`;
  }

  /*Compile the command to drop all views.*/
  public compileDropAllViews() {
    return `DECLARE @sql NVARCHAR(MAX) = N'';
    SELECT @sql +=
           'DROP VIEW ' + QUOTENAME(OBJECT_SCHEMA_NAME(object_id)) + '.' + QUOTENAME(name) + ';'
    FROM sys.views;

    EXEC sp_executesql @sql;`;
  }

  /*Create the column definition for a char type.*/
  protected typeChar(column: ColumnDefinition) {
    return `nchar(${column.length})`;
  }

  /*Create the column definition for a string type.*/
  protected typeString(column: ColumnDefinition) {
    return `nvarchar(${column.length})`;
  }

  /*Create the column definition for a tiny text type.*/
  protected typeTinyText(column: ColumnDefinition) {
    return 'nvarchar(255)';
  }

  /*Create the column definition for a text type.*/
  protected typeText(column: ColumnDefinition) {
    return 'nvarchar(max)';
  }

  /*Create the column definition for a medium text type.*/
  protected typeMediumText(column: ColumnDefinition) {
    return 'nvarchar(max)';
  }

  /*Create the column definition for a long text type.*/
  protected typeLongText(column: ColumnDefinition) {
    return 'nvarchar(max)';
  }

  /*Create the column definition for an integer type.*/
  protected typeInteger(column: ColumnDefinition) {
    return 'int';
  }

  /*Create the column definition for a big integer type.*/
  protected typeBigInteger(column: ColumnDefinition) {
    return 'bigint';
  }

  /*Create the column definition for a medium integer type.*/
  protected typeMediumInteger(column: ColumnDefinition) {
    return 'int';
  }

  /*Create the column definition for a tiny integer type.*/
  protected typeTinyInteger(column: ColumnDefinition) {
    return 'tinyint';
  }

  /*Create the column definition for a small integer type.*/
  protected typeSmallInteger(column: ColumnDefinition) {
    return 'smallint';
  }

  /*Create the column definition for a float type.*/
  protected typeFloat(column: ColumnDefinition) {
    return 'float';
  }

  /*Create the column definition for a double type.*/
  protected typeDouble(column: ColumnDefinition) {
    return 'float';
  }

  /*Create the column definition for a decimal type.*/
  protected typeDecimal(column: ColumnDefinition) {
    return `decimal(${column.total}, ${column.places})`;
  }

  /*Create the column definition for a boolean type.*/
  protected typeBoolean(column: ColumnDefinition) {
    return 'bit';
  }

  /*Create the column definition for an enumeration type.*/
  protected typeEnum(column: ColumnDefinition) {
    return `nvarchar(255) check ("${column.name}" in (${this.quoteString(column.allowed)}))`;
  }

  /*Create the column definition for a json type.*/
  protected typeJson(column: ColumnDefinition) {
    return 'nvarchar(max)';
  }

  /*Create the column definition for a jsonb type.*/
  protected typeJsonb(column: ColumnDefinition) {
    return 'nvarchar(max)';
  }

  /*Create the column definition for a date type.*/
  protected typeDate(column: ColumnDefinition) {
    return 'date';
  }

  /*Create the column definition for a date-time type.*/
  protected typeDateTime(column: ColumnDefinition) {
    return this.typeTimestamp(column);
  }

  /*Create the column definition for a date-time (with time zone) type.*/
  protected typeDateTimeTz(column: ColumnDefinition) {
    return this.typeTimestampTz(column);
  }

  /*Create the column definition for a time type.*/
  protected typeTime(column: ColumnDefinition) {
    return column.precision ? `time(${column.precision})` : 'time';
  }

  /*Create the column definition for a time (with time zone) type.*/
  protected typeTimeTz(column: ColumnDefinition) {
    return this.typeTime(column);
  }

  /*Create the column definition for a timestamp type.*/
  protected typeTimestamp(column: ColumnDefinition) {
    const columnType = column.precision ? `datetime2(${column.precision})` : 'datetime';
    return column.useCurrent ? `${columnType} default CURRENT_TIMESTAMP` : columnType;
  }

  /*Create the column definition for a timestamp (with time zone) type.*/
  protected typeTimestampTz(column: ColumnDefinition) {
    const columnType = column.precision ? `datetimeoffset(${column.precision})` : 'datetimeoffset';
    return column.useCurrent ? `${columnType} default CURRENT_TIMESTAMP` : columnType;
  }

  /*Create the column definition for a year type.*/
  protected typeYear(column: ColumnDefinition) {
    return this.typeInteger(column);
  }

  /*Create the column definition for a binary type.*/
  protected typeBinary(column: ColumnDefinition) {
    return 'varbinary(max)';
  }

  /*Create the column definition for a uuid type.*/
  protected typeUuid(column: ColumnDefinition) {
    return 'uniqueidentifier';
  }

  /*Create the column definition for an IP address type.*/
  protected typeIpAddress(column: ColumnDefinition) {
    return 'nvarchar(45)';
  }

  /*Create the column definition for a MAC address type.*/
  protected typeMacAddress(column: ColumnDefinition) {
    return 'nvarchar(17)';
  }

  /*Create the column definition for a spatial Geometry type.*/
  public typeGeometry(column: ColumnDefinition) {
    return 'geography';
  }

  /*Create the column definition for a spatial Point type.*/
  public typePoint(column: ColumnDefinition) {
    return 'geography';
  }

  /*Create the column definition for a spatial LineString type.*/
  public typeLineString(column: ColumnDefinition) {
    return 'geography';
  }

  /*Create the column definition for a spatial Polygon type.*/
  public typePolygon(column: ColumnDefinition) {
    return 'geography';
  }

  /*Create the column definition for a spatial GeometryCollection type.*/
  public typeGeometryCollection(column: ColumnDefinition) {
    return 'geography';
  }

  /*Create the column definition for a spatial MultiPoint type.*/
  public typeMultiPoint(column: ColumnDefinition) {
    return 'geography';
  }

  /*Create the column definition for a spatial MultiLineString type.*/
  public typeMultiLineString(column: ColumnDefinition) {
    return 'geography';
  }

  /*Create the column definition for a spatial MultiPolygon type.*/
  public typeMultiPolygon(column: ColumnDefinition) {
    return 'geography';
  }

  /*Create the column definition for a generated, computed column type.*/
  protected typeComputed(column: ColumnDefinition) {
    return `as (${column.expression})`;
  }

  /*Get the SQL for a collation column modifier.*/
  protected modifyCollate(blueprint: Blueprint, column: ColumnDefinition) {
    if (!isBlank(column.collation)) {
      return ' collate ' + column.collation;
    }
    return '';
  }

  /*Get the SQL for a nullable column modifier.*/
  protected modifyNullable(blueprint: Blueprint, column: ColumnDefinition) {
    if (column.type !== 'computed') {
      return column.nullable ? ' null' : ' not null';
    }

    return '';
  }

  /*Get the SQL for a default column modifier.*/
  protected modifyDefault(blueprint: Blueprint, column: ColumnDefinition) {
    if (!isBlank(column.default)) {
      return ' default ' + this.getDefaultValue(column.default);
    }

    return '';
  }

  /*Get the SQL for an auto-increment column modifier.*/
  protected modifyIncrement(blueprint: Blueprint, column: ColumnDefinition) {
    if (this.serials.includes(column.type) && column.autoIncrement) {
      return ' identity primary key';
    }

    return '';
  }

  /*Get the SQL for a generated stored column modifier.*/
  protected modifyPersisted(blueprint: Blueprint, column: ColumnDefinition) {
    if (column.persisted) {
      return ' persisted';
    }

    return '';
  }

  /*Wrap a table in keyword identifiers.*/
  public wrapTable(table: Blueprint | string) {
    if (table instanceof Blueprint && table._temporary) {
      this.setTablePrefix('#');
    }
    return super.wrapTable(table);
  }

  /*Quote the given string literal.*/
  public quoteString(value: any[] | string): string {
    if (isArray(value)) {
      return value.map(it => this.quoteString(it)).join(', ');
    }
    return `N'${value}'`;
  }
}
