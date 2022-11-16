/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank, isString } from '@gradii/nanofn';
import type { Connection } from '../../connection';
import type { Blueprint } from '../blueprint';
import type { ColumnDefinition } from '../column-definition';
import type { ForeignKeyDefinition } from '../foreign-key-definition';
import { SchemaGrammar } from './schema-grammar';

export class PostgresSchemaGrammar extends SchemaGrammar {
  /*If this Grammar supports schema changes wrapped in a transaction.*/
  protected transactions = true;
  /*The possible column modifiers.*/
  protected modifiers: string[] = [
    'Collate', 'Increment', 'Nullable', 'Default', 'VirtualAs', 'StoredAs'
  ];
  /*The columns available as serials.*/
  protected serials: string[] = [
    'bigInteger', 'integer', 'mediumInteger', 'smallInteger', 'tinyInteger'
  ];
  /*The commands to be executed outside of create or alter command.*/
  protected fluentCommands: string[] = ['Comment'];
  protected ColumnDefinitionCommands: string[] = ['Comment'];

  /*Compile a create database command.*/
  public compileCreateDatabase(name: string, connection: Connection) {
    return `create database ${this.wrapValue(name)} encoding ${this.wrapValue(
      connection.getConfig('charset'))}`;
  }

  /*Compile a drop database if exists command.*/
  public compileDropDatabaseIfExists(name: string) {
    return `drop database if exists ${this.wrapValue(name)}`;
  }

  /*Compile the query to determine if a table exists.*/
  public compileTableExists() {
    return `select *
            from information_schema.tables
            where table_catalog = ?
              and table_schema = ?
              and table_name = ?
              and table_type = 'BASE TABLE'`;
  }

  /*Compile the query to determine the list of columns.*/
  public compileColumnListing() {
    return `select column_name
            from information_schema.columns
            where table_catalog = ?
              and table_schema = ?
              and table_name = ?`;
  }

  /*Compile a create table command.*/
  public compileCreate(blueprint: Blueprint, command: ColumnDefinition) {
    return ([
      ...[
        `${blueprint._temporary ? 'create temporary' : 'create'} table ${this.wrapTable(
          blueprint)} (${this.getColumns(blueprint).join(', ')})`
      ], ...this.compileAutoIncrementStartingValues(blueprint)
    ]).filter(it => !!it);
  }

  /*Compile a column addition command.*/
  public compileAdd(blueprint: Blueprint, command: ColumnDefinition) {
    return ([
      ...[
        `alter table ${this.wrapTable(blueprint)} ${this.prefixArray('add column',
          this.getColumns(blueprint)).join(', ')}`
      ], ...this.compileAutoIncrementStartingValues(blueprint)
    ]).filter(it => !!it);
  }

  /*Compile the auto-incrementing column starting values.*/
  public compileAutoIncrementStartingValues(blueprint: Blueprint) {
    return blueprint.autoIncrementingStartingValues().map((value, column) => {
      return 'alter sequence ' + blueprint.getTable() + '_' + column + '_seq restart with ' + value;
    });
  }

  /*Compile a primary key command.*/
  public compilePrimary(blueprint: Blueprint, command: ColumnDefinition) {
    const columns = this.columnize(command.columns);
    return 'alter table ' + `${this.wrapTable(blueprint)} add primary key (${columns})`;
  }

  /*Compile a unique key command.*/
  public compileUnique(blueprint: Blueprint, command: ColumnDefinition) {
    return 'alter table ' + `${this.wrapTable(blueprint)} add constraint ${this.wrap(
      command.index)} unique (${this.columnize(command.columns)})`;
  }

  /*Compile a plain index key command.*/
  public compileIndex(blueprint: Blueprint, command: ColumnDefinition) {
    // language=SQL format=false
    return 'create index ' + `${this.wrap(command.index)} on ${
      this.wrapTable(blueprint)
    }${command.algorithm ? ' using ' + command.algorithm : ''
    } (${this.columnize(command.columns)})`;
  }

  /*Compile a spatial index key command.*/
  public compileSpatialIndex(blueprint: Blueprint, command: ColumnDefinition) {
    command.withAlgorithm('gist');
    return this.compileIndex(blueprint, command);
  }

  /*Compile a foreign key command.*/
  public compileForeign(blueprint: Blueprint, command: ColumnDefinition) {
    let sql = super.compileForeign(blueprint, command as ForeignKeyDefinition);
    if (!isBlank(command.deferrable)) {
      sql += command.deferrable ? ' deferrable' : ' not deferrable';
    }
    if (command.deferrable && !isBlank(command.initiallyImmediate)) {
      sql += command.initiallyImmediate ? ' initially immediate' : ' initially deferred';
    }
    if (!isBlank(command.notValid)) {
      sql += ' not valid';
    }
    return sql;
  }

  /*Compile a drop table command.*/
  public compileDrop(blueprint: Blueprint, command: ColumnDefinition) {
    return `drop table ${this.wrapTable(blueprint)}`;
  }

  /*Compile a drop table (if exists) command.*/
  public compileDropIfExists(blueprint: Blueprint, command: ColumnDefinition) {
    return `drop table if exists ${this.wrapTable(blueprint)}`;
  }

  /*Compile the SQL needed to drop all tables.*/
  public compileDropAllTables(tables: any[]) {
    return `drop table "${tables.join('","')}" cascade`;
  }

  /*Compile the SQL needed to drop all views.*/
  public compileDropAllViews(views: any[]) {
    return `drop view "${views.join('","')}" cascade`;
  }

  /*Compile the SQL needed to drop all types.*/
  public compileDropAllTypes(types: any[]) {
    return `drop type "${types.join('","')}" cascade`;
  }

  /*Compile the SQL needed to retrieve all table names.*/
  public compileGetAllTables(searchPath: string[]) {
    return `select tablename
            from pg_catalog.pg_tables
            where schemaname in ('${searchPath.join('\',\'')}')`;
  }

  /*Compile the SQL needed to retrieve all view names.*/
  public compileGetAllViews(searchPath: string[]) {
    return `select viewname
            from pg_catalog.pg_views
            where schemaname in ('${searchPath.join('\',\'')}')`;
  }

  /*Compile the SQL needed to retrieve all type names.*/
  public compileGetAllTypes() {
    return `select distinct pg_type.typname
            from pg_type
                   inner join pg_enum on pg_enum.enumtypid = pg_type.oid`;
  }

  /*Compile a drop column command.*/
  public compileDropColumn(blueprint: Blueprint, command: ColumnDefinition) {
    const columns = this.prefixArray('drop column', this.wrapArray(command.columns));
    return `alter table ${this.wrapTable(blueprint)} ${columns.join(', ')}`;
  }

  /*Compile a drop primary key command.*/
  public compileDropPrimary(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(`${blueprint.getTable()}_pkey`);
    return `alter table ${this.wrapTable(blueprint)} drop constraint ${index}`;
  }

  /*Compile a drop unique key command.*/
  public compileDropUnique(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return `alter table ${this.wrapTable(blueprint)} drop constraint ${index}`;
  }

  /*Compile a drop index command.*/
  public compileDropIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return 'drop index ' + `${this.wrap(command.index)}`;
  }

  /*Compile a drop spatial index command.*/
  public compileDropSpatialIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return this.compileDropIndex(blueprint, command);
  }

  /*Compile a drop foreign key command.*/
  public compileDropForeign(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return 'alter table ' + `${this.wrapTable(blueprint)} drop constraint ${index}`;
  }

  /*Compile a rename table command.*/
  public compileRename(blueprint: Blueprint, command: ColumnDefinition) {
    const from = this.wrapTable(blueprint);
    return 'alter table ' + `${from} rename to ${this.wrapTable(command.to)}`;
  }

  /*Compile a rename index command.*/
  public compileRenameIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return 'alter index ' + `${this.wrap(command.from)} rename to ${this.wrap(command.to)}`;
  }

  /*Compile the command to enable foreign key constraints.*/
  public compileEnableForeignKeyConstraints() {
    return 'SET CONSTRAINTS ALL IMMEDIATE;';
  }

  /*Compile the command to disable foreign key constraints.*/
  public compileDisableForeignKeyConstraints() {
    return 'SET CONSTRAINTS ALL DEFERRED;';
  }

  /**
   * Compile a comment command.
   * @todo check me
   */
  public compileComment(blueprint: Blueprint, command: ColumnDefinition) {
    return `comment on column ${this.wrapTable(blueprint)}.${this.wrap(
      command.get('column').name)} is ${`'${command.get('column').comment.replace(/'/g, `''`)}'`}`;
  }

  /*Create the column definition for a char type.*/
  protected typeChar(column: ColumnDefinition) {
    return `char(${column.length})`;
  }

  /*Create the column definition for a string type.*/
  protected typeString(column: ColumnDefinition) {
    return `varchar(${column.length})`;
  }

  /*Create the column definition for a tiny text type.*/
  protected typeTinyText(column: ColumnDefinition) {
    return 'varchar(255)';
  }

  /*Create the column definition for a text type.*/
  protected typeText(column: ColumnDefinition) {
    return 'text';
  }

  /*Create the column definition for a medium text type.*/
  protected typeMediumText(column: ColumnDefinition) {
    return 'text';
  }

  /*Create the column definition for a long text type.*/
  protected typeLongText(column: ColumnDefinition) {
    return 'text';
  }

  /*Create the column definition for an integer type.*/
  protected typeInteger(column: ColumnDefinition) {
    return this.generatableColumn('integer', column);
  }

  /*Create the column definition for a big integer type.*/
  protected typeBigInteger(column: ColumnDefinition) {
    return this.generatableColumn('bigint', column);
  }

  /*Create the column definition for a medium integer type.*/
  protected typeMediumInteger(column: ColumnDefinition) {
    return this.generatableColumn('integer', column);
  }

  /*Create the column definition for a tiny integer type.*/
  protected typeTinyInteger(column: ColumnDefinition) {
    return this.generatableColumn('smallint', column);
  }

  /*Create the column definition for a small integer type.*/
  protected typeSmallInteger(column: ColumnDefinition) {
    return this.generatableColumn('smallint', column);
  }

  /*Create the column definition for a generatable column.*/
  protected generatableColumn(type: string, column: ColumnDefinition) {
    if (!column.autoIncrement && isBlank(column.generatedAs)) {
      return type;
    }
    if (column.autoIncrement && isBlank(column.generatedAs)) {
      return {
        'integer' : 'serial',
        'bigint'  : 'bigserial',
        'smallint': 'smallserial'
      }[type];
    }
    let options = '';
    if (isString(column.generatedAs) && column.generatedAs.length) {
      options = ` (${column.generatedAs})`;
    }
    return `${type} generated ${column.always ? 'always' : 'by default'} as identity${options}`;
  }

  /*Create the column definition for a float type.*/
  protected typeFloat(column: ColumnDefinition) {
    return this.typeDouble(column);
  }

  /*Create the column definition for a double type.*/
  protected typeDouble(column: ColumnDefinition) {
    return 'double precision';
  }

  /*Create the column definition for a real type.*/
  protected typeReal(column: ColumnDefinition) {
    return 'real';
  }

  /*Create the column definition for a decimal type.*/
  protected typeDecimal(column: ColumnDefinition) {
    return `decimal(${column.total}, ${column.places})`;
  }

  /*Create the column definition for a boolean type.*/
  protected typeBoolean(column: ColumnDefinition) {
    return 'boolean';
  }

  /*Create the column definition for an enumeration type.*/
  protected typeEnum(column: ColumnDefinition) {
    return `varchar(255) check ("${column.name}" in (${this.quoteString(column.allowed)}))`;
  }

  /*Create the column definition for a json type.*/
  protected typeJson(column: ColumnDefinition) {
    return 'json';
  }

  /*Create the column definition for a jsonb type.*/
  protected typeJsonb(column: ColumnDefinition) {
    return 'jsonb';
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
    return `time${
      isBlank(column.precision) ?
        '' : `(${column.precision})`
    } without time zone`;
  }

  /*Create the column definition for a time (with time zone) type.*/
  protected typeTimeTz(column: ColumnDefinition) {
    return `time${
      isBlank(column.precision) ?
        '' : `(${column.precision})`
    } with time zone`;
  }

  /*Create the column definition for a timestamp type.*/
  protected typeTimestamp(column: ColumnDefinition) {
    const columnType = `timestamp${
      isBlank(column.precision) ?
        '' : `(${column.precision})`
    } without time zone`;
    return column.useCurrent ? '"$columnType default CURRENT_TIMESTAMP" ' : columnType;
  }

  /*Create the column definition for a timestamp (with time zone) type.*/
  protected typeTimestampTz(column: ColumnDefinition) {
    const columnType = `timestamp${
      isBlank(column.precision) ?
        '' : `(${column.precision})`} with time zone`;
    return column.useCurrent ? `${columnType} default CURRENT_TIMESTAMP` : columnType;
  }

  /*Create the column definition for a year type.*/
  protected typeYear(column: ColumnDefinition) {
    return this.typeInteger(column);
  }

  /*Create the column definition for a binary type.*/
  protected typeBinary(column: ColumnDefinition) {
    return 'bytea';
  }

  /*Create the column definition for a uuid type.*/
  protected typeUuid(column: ColumnDefinition) {
    return 'uuid';
  }

  /*Create the column definition for an IP address type.*/
  protected typeIpAddress(column: ColumnDefinition) {
    return 'inet';
  }

  /*Create the column definition for a MAC address type.*/
  protected typeMacAddress(column: ColumnDefinition) {
    return 'macaddr';
  }

  /*Create the column definition for a spatial Geometry type.*/
  protected typeGeometry(column: ColumnDefinition) {
    return this.formatPostGisType('geometry', column);
  }

  /*Create the column definition for a spatial Point type.*/
  protected typePoint(column: ColumnDefinition) {
    return this.formatPostGisType('point', column);
  }

  /*Create the column definition for a spatial LineString type.*/
  protected typeLineString(column: ColumnDefinition) {
    return this.formatPostGisType('linestring', column);
  }

  /*Create the column definition for a spatial Polygon type.*/
  protected typePolygon(column: ColumnDefinition) {
    return this.formatPostGisType('polygon', column);
  }

  /*Create the column definition for a spatial GeometryCollection type.*/
  protected typeGeometryCollection(column: ColumnDefinition) {
    return this.formatPostGisType('geometrycollection', column);
  }

  /*Create the column definition for a spatial MultiPoint type.*/
  protected typeMultiPoint(column: ColumnDefinition) {
    return this.formatPostGisType('multipoint', column);
  }

  /*Create the column definition for a spatial MultiLineString type.*/
  public typeMultiLineString(column: ColumnDefinition) {
    return this.formatPostGisType('multilinestring', column);
  }

  /*Create the column definition for a spatial MultiPolygon type.*/
  protected typeMultiPolygon(column: ColumnDefinition) {
    return this.formatPostGisType('multipolygon', column);
  }

  /*Create the column definition for a spatial MultiPolygonZ type.*/
  protected typeMultiPolygonZ(column: ColumnDefinition) {
    return this.formatPostGisType('multipolygonz', column);
  }

  /*Format the column definition for a PostGIS spatial type.*/
  private formatPostGisType(type: string, column: ColumnDefinition) {
    if (column.isGeometry === null) {
      return `geography(${type}, ${column.projection ?? '4326'})`;
    }
    if (column.projection !== null) {
      return `geometry(${type}, ${column.projection})`;
    }
    return `geometry(${type})`;
  }

  /*Get the SQL for a collation column modifier.*/
  protected modifyCollate(blueprint: Blueprint, column: ColumnDefinition) {
    if (!isBlank(column.collation)) {
      return ' collate ' + this.wrapValue(column.collation);
    }
    return '';
  }

  /*Get the SQL for a nullable column modifier.*/
  protected modifyNullable(blueprint: Blueprint, column: ColumnDefinition) {
    return column.nullable ? ' null' : ' not null';
  }

  /*Get the SQL for a default column modifier.*/
  protected modifyDefault(blueprint: Blueprint, column: ColumnDefinition) {
    if (!isBlank(column.default)) {
      return ` default ${this.getDefaultValue(column.default)}`;
    }
    return '';
  }

  /*Get the SQL for an auto-increment column modifier.*/
  protected modifyIncrement(blueprint: Blueprint, column: ColumnDefinition) {
    if ((
      this.serials.includes(column.type) ||
      column.generatedAs !== null
    ) && column.autoIncrement) {
      return ' primary key';
    }
    return '';
  }

  /*Get the SQL for a generated virtual column modifier.*/
  protected modifyVirtualAs(blueprint: Blueprint, column: ColumnDefinition) {
    if (column.virtualAs !== null) {
      return ` generated always as (${column.virtualAs})`;
    }
    return '';
  }

  /*Get the SQL for a generated stored column modifier.*/
  protected modifyStoredAs(blueprint: Blueprint, column: ColumnDefinition) {
    if (column.storedAs !== null) {
      return ` generated always as (${column.storedAs}) stored`;
    }
    return '';
  }
}
