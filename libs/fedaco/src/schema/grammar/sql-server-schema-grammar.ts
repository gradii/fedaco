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
  /* If this Grammar supports schema changes wrapped in a transaction. */
  protected transactions = true;
  /* The possible column modifiers. */
  protected modifiers: string[] = ['Collate', 'Nullable', 'Default', 'Persisted', 'Increment'];
  /* The columns available as serials. */
  protected serials: string[] = ['tinyInteger', 'smallInteger', 'mediumInteger', 'integer', 'bigInteger'];

  protected fluentCommands = ['Default'];

  public compileDefaultSchema() {
    return 'select schema_name()';
  }

  /* Compile a create database command. */
  public compileCreateDatabase(name: string, connection: Connection) {
    return `create database ${this.wrapValue(name)}`;
  }

  /* Compile a drop database if exists command. */
  public compileDropDatabaseIfExists(name: string) {
    return `drop database if exists ${this.wrapValue(name)}`;
  }

  /**
   * Compile the query to determine the tables.
   *
   * @return string
   */
  public compileTables() {
    return `select t.name as name, schema_name(t.schema_id) as [schema], sum(u.total_pages) * 8 * 1024 as size
            from sys.tables as t
                   join sys.partitions as p on p.object_id = t.object_id
                   join sys.allocation_units as u on u.container_id = p.hobt_id
            group by t.name, t.schema_id
            order by t.name`;
  }

  /**
   * Compile the query to determine the views.
   *
   * @return string
   */
  public compileViews() {
    return `select name, schema_name(v.schema_id) as [schema], definition
            from sys.views as v
                   inner join sys.sql_modules as m on v.object_id = m.object_id
            order by name`;
  }

  /**
   * Compile the query to determine the columns.
   *
   */
  public compileColumns(schema: string, table: string): string {
    return `select col.name,
                   type.name          as type_name,
                   col.max_length     as length,
                   col.precision      as precision,
                   col.scale          as places,
                   col.is_nullable    as nullable,
                   def.definition as [default], col.is_identity as autoincrement,
                   col.collation_name as collation,
                   com.definition as [expression], is_persisted as [persisted], cast(prop.value as nvarchar(max)) as comment
            from sys.columns as col
                   join sys.types as type on col.user_type_id = type.user_type_id
                   join sys.objects as obj on col.object_id = obj.object_id
                   join sys.schemas as scm on obj.schema_id = scm.schema_id
                   left join sys.default_constraints def
                             on col.default_object_id = def.object_id and col.object_id = def.parent_object_id
                   left join sys.extended_properties as prop
                             on obj.object_id = prop.major_id and col.column_id = prop.minor_id and
                                prop.name = 'MS_Description'
                   left join sys.computed_columns as com
                             on col.column_id = com.column_id and col.object_id = com.object_id
            where obj.type in ('U', 'V')
              and obj.name = ${this.quoteString(table)}
              and scm.name = ${schema ? this.quoteString(schema) : 'schema_name()'}
            order by col.column_id`;
  }

  /**
   * Compile the query to determine the indexes.
   */
  public compileIndexes(schema: string, table: string) {
    return `select idx.name                                                             as name,
                   string_agg(col.name, ',') within group (order by idxcol.key_ordinal) as columns,
                   idx.type_desc as [type], idx.is_unique as [unique], idx.is_primary_key as [primary]
            from sys.indexes as idx join sys.tables as tbl
            on idx.object_id = tbl.object_id join sys.schemas as scm on tbl.schema_id = scm.schema_id join sys.index_columns as idxcol on idx.object_id = idxcol.object_id and idx.index_id = idxcol.index_id join sys.columns as col on idxcol.object_id = col.object_id and idxcol.column_id = col.column_id
            where tbl.name = ${this.quoteString(table)}
              and scm.name = ${schema ? this.quoteString(schema) : 'schema_name()'}
            group by idx.name, idx.type_desc, idx.is_unique, idx.is_primary_key`;
  }

  /**
   * Compile the query to determine the foreign keys.
   *
   */
  public compileForeignKeys(schema: string, table: string) {
    return `select fk.name                                                                   as name,
                   string_agg(lc.name, ',') within group (order by fkc.constraint_column_id) as columns,
                   fs.name                                                                   as foreign_schema,
                   ft.name                                                                   as foreign_table,
                   string_agg(fc.name, ',') within group (order by fkc.constraint_column_id) as foreign_columns,
                   fk.update_referential_action_desc                                         as on_update,
                   fk.delete_referential_action_desc                                         as on_delete
            from sys.foreign_keys as fk
                   join sys.foreign_key_columns as fkc on fkc.constraint_object_id = fk.object_id
                   join sys.tables as lt on lt.object_id = fk.parent_object_id
                   join sys.schemas as ls on lt.schema_id = ls.schema_id
                   join sys.columns as lc on fkc.parent_object_id = lc.object_id and fkc.parent_column_id = lc.column_id
                   join sys.tables as ft on ft.object_id = fk.referenced_object_id
                   join sys.schemas as fs on ft.schema_id = fs.schema_id
                   join sys.columns as fc
                        on fkc.referenced_object_id = fc.object_id and fkc.referenced_column_id = fc.column_id
            where lt.name = ${this.quoteString(table)}
              and ls.name = ${schema ? this.quoteString(schema) : 'schema_name()'}
            group by fk.name, fs.name, ft.name, fk.update_referential_action_desc, fk.delete_referential_action_desc`;
  }

  /* Compile a create table command. */
  public compileCreate(blueprint: Blueprint, command: ColumnDefinition) {
    const columns = this.getColumns(blueprint).join(', ');
    return `create table ` + `${this.wrapTable(blueprint)} (${columns})`;
  }

  /* Compile a column addition table command. */
  public compileAdd(blueprint: Blueprint, command: ColumnDefinition) {
    // language=SQL format=false
    return `alter table ` + `${this.wrapTable(blueprint)} add ${this.getColumns(blueprint).join(', ')}`;
  }

  /**
   * Compile a rename column command.
   *
   * @param  \Illuminate\Database\Schema\Blueprint  $blueprint
   * @param  \Illuminate\Support\Fluent  $command
   * @param  \Illuminate\Database\Connection  $connection
   * @return array|string
   */
  public compileRenameColumn(blueprint: Blueprint, command: ColumnDefinition, connection: Connection) {
    return `sp_rename ${this.quoteString(`${this.wrapTable(blueprint)}.${this.wrap(command.from)}`)}, ${this.wrap(
      command.to,
    )}, N'COLUMN'`;
  }

  /**
   * Compile a change column command into a series of SQL statements.
   *
   */
  public compileChange(blueprint: Blueprint, command: ColumnDefinition, connection: Connection) {
    const changes = [this.compileDropDefaultConstraint(blueprint, command)];
    for (const column of blueprint.getChangedColumns()) {
      let sql = `alter table ${this.wrapTable(blueprint)}
        alter column ${this.wrap(column)} ${this.getType(column)}`;

      for (const modifier of this.modifiers) {
        const method = `modify${modifier}`;
        if (method in this) {
          // @ts-ignore
          sql += this[method](blueprint, column);
        }
      }

      changes.push(sql);
    }

    return changes;
  }

  /* Compile a primary key command. */
  public compilePrimary(blueprint: Blueprint, command: ColumnDefinition) {
    // language=SQL format=false
    return `alter table ${this.wrapTable(blueprint)} add constraint ${this.wrap(
      command.index,
    )} primary key (${this.columnize(command.columns)})`;
  }

  /* Compile a unique key command. */
  public compileUnique(blueprint: Blueprint, command: ColumnDefinition) {
    // language=SQL format=false
    return (
      `create unique index ` +
      `${this.wrap(command.index)} on ${this.wrapTable(blueprint)} (${this.columnize(command.columns)})`
    );
  }

  /* Compile a plain index key command. */
  public compileIndex(blueprint: Blueprint, command: ColumnDefinition) {
    // language=SQL format=false
    return (
      'create index ' +
      `${this.wrap(command.index)} on ${this.wrapTable(blueprint)} (${this.columnize(command.columns)})`
    );
  }

  /* Compile a spatial index key command. */
  public compileSpatialIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return `create spatial index ${this.wrap(command.index)} on ${this.wrapTable(
      blueprint,
    )} (${this.columnize(command.columns)})`;
  }

  /**
   * Compile a default command.
   *
   */
  public compileDefault(blueprint: Blueprint, command: ColumnDefinition) {
    if (command.column.change && !isBlank(command.column.default)) {
      return `alter table ${this.wrapTable(blueprint)} add default ${this.getDefaultValue(
        command.column.default,
      )} for ${this.wrap(command.column)}`;
    }

    return '';
  }

  /* Compile a drop table command. */
  public compileDrop(blueprint: Blueprint, command: ColumnDefinition) {
    return 'drop table ' + this.wrapTable(blueprint);
  }

  /* Compile a drop table (if exists) command. */
  public compileDropIfExists(blueprint: Blueprint, command: ColumnDefinition) {
    return `if object_id(${this.quoteString(this.wrapTable(blueprint))}, 'U') is not null drop table ${this.wrapTable(
      blueprint,
    )}`;
  }

  /* Compile the SQL needed to drop all tables. */
  public compileDropAllTables() {
    return `EXEC sp_msforeachtable 'DROP TABLE ?'`;
  }

  /* Compile a drop column command. */
  public compileDropColumn(blueprint: Blueprint, command: ColumnDefinition) {
    const columns = this.wrapArray(command.columns);
    const dropExistingConstraintsSql = this.compileDropDefaultConstraint(blueprint, command) + ';';
    return (
      `${dropExistingConstraintsSql}` + `alter table ${this.wrapTable(blueprint)} drop column ${columns.join(', ')}`
    );
  }

  /* Compile a drop default constraint command. */
  public compileDropDefaultConstraint(blueprint: Blueprint, command: ColumnDefinition) {
    const columns = `'${command.columns.join("','")}'`;
    const tableName = this.getTablePrefix() + blueprint.getTable();
    let sql = "DECLARE @sql NVARCHAR(MAX) = '';";
    sql += `SELECT @sql += 'ALTER TABLE [dbo].[${tableName}] DROP CONSTRAINT ' + OBJECT_NAME([default_object_id]) + ';' `;
    sql += 'FROM SYS.COLUMNS ';
    sql += `WHERE [object_id] = OBJECT_ID('[dbo].[${tableName}]') AND [name] in (${columns}) AND [default_object_id] <> 0;`;
    sql += 'EXEC(@sql)';
    return sql;
  }

  /* Compile a drop primary key command. */
  public compileDropPrimary(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return `alter table ${this.wrapTable(blueprint)} drop constraint ${index}`;
  }

  /* Compile a drop unique key command. */
  public compileDropUnique(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return `drop ` + `index ${index} on ${this.wrapTable(blueprint)}`;
  }

  /* Compile a drop index command. */
  public compileDropIndex(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return `drop ` + `index ${index} on ${this.wrapTable(blueprint)}`;
  }

  /* Compile a drop spatial index command. */
  public compileDropSpatialIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return this.compileDropIndex(blueprint, command);
  }

  /* Compile a drop foreign key command. */
  public compileDropForeign(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return `alter table ${this.wrapTable(blueprint)} drop constraint ${index}`;
  }

  /* Compile a rename table command. */
  public compileRename(blueprint: Blueprint, command: ColumnDefinition) {
    const from = this.wrapTable(blueprint);
    return `sp_rename ${from}, ${this.wrapTable(command.to)}`;
  }

  /* Compile a rename index command. */
  public compileRenameIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return `sp_rename N'${this.wrap(blueprint.getTable() + '.' + command.from)}', ${this.wrap(command.to)}, N'INDEX'`;
  }

  /* Compile the command to enable foreign key constraints. */
  public compileEnableForeignKeyConstraints() {
    return 'EXEC sp_msforeachtable @command1="print \'?\'", @command2="ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all";';
  }

  /* Compile the command to disable foreign key constraints. */
  public compileDisableForeignKeyConstraints() {
    return 'EXEC sp_msforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";';
  }

  /* Compile the command to drop all foreign keys. */
  public compileDropAllForeignKeys() {
    return `DECLARE @sql NVARCHAR(MAX) = N'';
    SELECT @sql += 'ALTER TABLE '
      + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + + QUOTENAME(OBJECT_NAME(parent_object_id))
      + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
    FROM sys.foreign_keys;

    EXEC sp_executesql @sql;`;
  }

  /* Compile the command to drop all views. */
  public compileDropAllViews() {
    return `DECLARE @sql NVARCHAR(MAX) = N'';
    SELECT @sql +=
           'DROP VIEW ' + QUOTENAME(OBJECT_SCHEMA_NAME(object_id)) + '.' + QUOTENAME(name) + ';'
    FROM sys.views;

    EXEC sp_executesql @sql;`;
  }

  /* Create the column definition for a char type. */
  protected typeChar(column: ColumnDefinition) {
    return `nchar(${column.length})`;
  }

  /* Create the column definition for a string type. */
  protected typeString(column: ColumnDefinition) {
    return `nvarchar(${column.length})`;
  }

  /* Create the column definition for a tiny text type. */
  protected typeTinyText(column: ColumnDefinition) {
    return 'nvarchar(255)';
  }

  /* Create the column definition for a text type. */
  protected typeText(column: ColumnDefinition) {
    return 'nvarchar(max)';
  }

  /* Create the column definition for a medium text type. */
  protected typeMediumText(column: ColumnDefinition) {
    return 'nvarchar(max)';
  }

  /* Create the column definition for a long text type. */
  protected typeLongText(column: ColumnDefinition) {
    return 'nvarchar(max)';
  }

  /* Create the column definition for an integer type. */
  protected typeInteger(column: ColumnDefinition) {
    return 'int';
  }

  /* Create the column definition for a big integer type. */
  protected typeBigInteger(column: ColumnDefinition) {
    return 'bigint';
  }

  /* Create the column definition for a medium integer type. */
  protected typeMediumInteger(column: ColumnDefinition) {
    return 'int';
  }

  /* Create the column definition for a tiny integer type. */
  protected typeTinyInteger(column: ColumnDefinition) {
    return 'tinyint';
  }

  /* Create the column definition for a small integer type. */
  protected typeSmallInteger(column: ColumnDefinition) {
    return 'smallint';
  }

  /* Create the column definition for a float type. */
  protected typeFloat(column: ColumnDefinition) {
    return 'float';
  }

  /* Create the column definition for a double type. */
  protected typeDouble(column: ColumnDefinition) {
    return 'float';
  }

  /* Create the column definition for a decimal type. */
  protected typeDecimal(column: ColumnDefinition) {
    return `decimal(${column.total}, ${column.places})`;
  }

  /* Create the column definition for a boolean type. */
  protected typeBoolean(column: ColumnDefinition) {
    return 'bit';
  }

  /* Create the column definition for an enumeration type. */
  protected typeEnum(column: ColumnDefinition) {
    return `nvarchar(255) check ("${column.name}" in (${this.quoteString(column.allowed)}))`;
  }

  /* Create the column definition for a json type. */
  protected typeJson(column: ColumnDefinition) {
    return 'nvarchar(max)';
  }

  /* Create the column definition for a jsonb type. */
  protected typeJsonb(column: ColumnDefinition) {
    return 'nvarchar(max)';
  }

  /* Create the column definition for a date type. */
  protected typeDate(column: ColumnDefinition) {
    return 'date';
  }

  /* Create the column definition for a date-time type. */
  protected typeDateTime(column: ColumnDefinition) {
    return this.typeTimestamp(column);
  }

  /* Create the column definition for a date-time (with time zone) type. */
  protected typeDateTimeTz(column: ColumnDefinition) {
    return this.typeTimestampTz(column);
  }

  /* Create the column definition for a time type. */
  protected typeTime(column: ColumnDefinition) {
    return column.precision ? `time(${column.precision})` : 'time';
  }

  /* Create the column definition for a time (with time zone) type. */
  protected typeTimeTz(column: ColumnDefinition) {
    return this.typeTime(column);
  }

  /* Create the column definition for a timestamp type. */
  protected typeTimestamp(column: ColumnDefinition) {
    const columnType = column.precision ? `datetime2(${column.precision})` : 'datetime';
    return column.useCurrent ? `${columnType} default CURRENT_TIMESTAMP` : columnType;
  }

  /* Create the column definition for a timestamp (with time zone) type. */
  protected typeTimestampTz(column: ColumnDefinition) {
    const columnType = column.precision ? `datetimeoffset(${column.precision})` : 'datetimeoffset';
    return column.useCurrent ? `${columnType} default CURRENT_TIMESTAMP` : columnType;
  }

  /* Create the column definition for a year type. */
  protected typeYear(column: ColumnDefinition) {
    return this.typeInteger(column);
  }

  /* Create the column definition for a binary type. */
  protected typeBinary(column: ColumnDefinition) {
    return 'varbinary(max)';
  }

  /* Create the column definition for a uuid type. */
  protected typeUuid(column: ColumnDefinition) {
    return 'uniqueidentifier';
  }

  /* Create the column definition for an IP address type. */
  protected typeIpAddress(column: ColumnDefinition) {
    return 'nvarchar(45)';
  }

  /* Create the column definition for a MAC address type. */
  protected typeMacAddress(column: ColumnDefinition) {
    return 'nvarchar(17)';
  }

  /* Create the column definition for a spatial Geometry type. */
  public typeGeometry(column: ColumnDefinition) {
    return 'geography';
  }

  /* Create the column definition for a spatial Point type. */
  public typePoint(column: ColumnDefinition) {
    return 'geography';
  }

  /* Create the column definition for a spatial LineString type. */
  public typeLineString(column: ColumnDefinition) {
    return 'geography';
  }

  /* Create the column definition for a spatial Polygon type. */
  public typePolygon(column: ColumnDefinition) {
    return 'geography';
  }

  /* Create the column definition for a spatial GeometryCollection type. */
  public typeGeometryCollection(column: ColumnDefinition) {
    return 'geography';
  }

  /* Create the column definition for a spatial MultiPoint type. */
  public typeMultiPoint(column: ColumnDefinition) {
    return 'geography';
  }

  /* Create the column definition for a spatial MultiLineString type. */
  public typeMultiLineString(column: ColumnDefinition) {
    return 'geography';
  }

  /* Create the column definition for a spatial MultiPolygon type. */
  public typeMultiPolygon(column: ColumnDefinition) {
    return 'geography';
  }

  /* Create the column definition for a generated, computed column type. */
  protected typeComputed(column: ColumnDefinition) {
    return `as (${column.expression})`;
  }

  /* Get the SQL for a collation column modifier. */
  protected modifyCollate(blueprint: Blueprint, column: ColumnDefinition) {
    if (!isBlank(column.collation)) {
      return ' collate ' + column.collation;
    }
    return '';
  }

  /* Get the SQL for a nullable column modifier. */
  protected modifyNullable(blueprint: Blueprint, column: ColumnDefinition) {
    if (column.type !== 'computed') {
      return column.nullable ? ' null' : ' not null';
    }

    return '';
  }

  /* Get the SQL for a default column modifier. */
  protected modifyDefault(blueprint: Blueprint, column: ColumnDefinition) {
    if (!isBlank(column.default)) {
      return ' default ' + this.getDefaultValue(column.default);
    }

    return '';
  }

  /* Get the SQL for an auto-increment column modifier. */
  protected modifyIncrement(blueprint: Blueprint, column: ColumnDefinition) {
    if (this.serials.includes(column.type) && column.autoIncrement) {
      return ' identity primary key';
    }

    return '';
  }

  /* Get the SQL for a generated stored column modifier. */
  protected modifyPersisted(blueprint: Blueprint, column: ColumnDefinition) {
    if (column.persisted) {
      return ' persisted';
    }

    return '';
  }

  /* Wrap a table in keyword identifiers. */
  public wrapTable(table: Blueprint | string): string {
    if (table instanceof Blueprint && table._temporary) {
      this.setTablePrefix('#');
    }
    return super.wrapTable(table);
  }

  /* Quote the given string literal. */
  public quoteString(value: any[] | string): string {
    if (isArray(value)) {
      return value.map((it) => this.quoteString(it)).join(', ');
    }
    return `N'${value}'`;
  }
}
