/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank, isNumber } from '@gradii/nanofn';
import { ta } from 'date-fns/locale';
import type { Connection } from '../../connection';
import type { Blueprint } from '../blueprint';
import type { ColumnDefinition } from '../column-definition';
import { SchemaGrammar } from './schema-grammar';

export class MysqlSchemaGrammar extends SchemaGrammar {
  /*The possible column modifiers.*/
  protected modifiers: string[] = [
    'Unsigned', 'Charset', 'Collate', 'VirtualAs', 'StoredAs', 'Nullable', 'Srid', 'Default',
    'Increment', 'Comment', 'After', 'First'
  ];
  /*The possible column serials.*/
  protected serials: string[] = [
    'bigInteger', 'integer', 'mediumInteger', 'smallInteger', 'tinyInteger'
  ];

  /*Compile a create database command.*/
  public compileCreateDatabase(name: string, connection: Connection) {
    const charset   = connection.getConfig('charset');
    const collation = connection.getConfig('collation');

    if (!charset || !collation) {
      return `create database ${this.wrapValue(name)}`;
    }

    return `create database ${this.wrapValue(name)} default character set ${charset} default collate ${collation}`;
  }

  /*Compile a drop database if exists command.*/
  public compileDropDatabaseIfExists(name: string) {
    return `drop database if exists ${this.wrapValue(name)}`;
  }

  /**
   * Compile the query to determine the tables.
   *
   * @param  database
   * @return string
   */
  public compileTables(database: string) {
    return `select table_name                   as \`name\`,
                   (data_length + index_length) as \`size\`,
                   table_comment                as \`comment\`,
                   engine                       as \`engine\`,
                   table_collation              as \`collation\`
            from information_schema.tables
            where table_schema = ${this.quoteString(database)}
              and table_type in ('BASE TABLE', 'SYSTEM VERSIONED')
            order by table_name`;
  }

  /**
   * Compile the query to determine the views.
   *
   * @param  database
   * @return string
   */
  public compileViews(database: string) {
    return `select table_name as \`name\`, view_definition as \`definition\`
            from information_schema.views
            where table_schema = ${this.quoteString(database)}
            order by table_name`;
  }

  /**
   * Compile the query to determine the columns.
   *
   * @param  database
   * @param  table
   * @return string
   */
  public compileColumns(database: string, table?: string) {
    return `select column_name           as \`name\`,
                   data_type             as \`type_name\`,
                   column_type           as \`type\`,
                   collation_name        as \`collation\`,
                   is_nullable           as \`nullable\`,
                   column_default        as \`default\`,
                   column_comment        as \`comment\`,
                   generation_expression as \`expression\`,
                   extra                 as \`extra\`
            from information_schema.columns
            where table_schema = ${
              this.quoteString(database)
            }
              and table_name = ${
              this.quoteString(table)
            }
            order by ordinal_position asc`;
  }

  /**
   * Compile the query to determine the indexes.
   */
  public compileIndexes(database: string, table: string) {
    return `select index_name                                      as \`name\`,
                   group_concat(column_name order by seq_in_index) as \`columns\`,
                   index_type                                      as \`type\`,
                   not non_unique                                  as \`unique\`
            from information_schema.statistics
            where table_schema = ${
              this.quoteString(database)
            }
              and table_name = ${
              this.quoteString(table)
            }
            group by index_name, index_type, non_unique`;
  }

  /**
   * Compile the query to determine the foreign keys.
   *
   */
  public compileForeignKeys(database: string, table: string) {
    return `select kc.constraint_name                                                   as \`name\`,
                   group_concat(kc.column_name order by kc.ordinal_position)            as \`columns\`,
                   kc.referenced_table_schema                                           as \`foreign_schema\`,
                   kc.referenced_table_name                                             as \`foreign_table\`,
                   group_concat(kc.referenced_column_name order by kc.ordinal_position) as \`foreign_columns\`,
                   rc.update_rule                                                       as \`on_update\`,
                   rc.delete_rule                                                       as \`on_delete\`
            from information_schema.key_column_usage kc
                   join information_schema.referential_constraints rc
                        on kc.constraint_schema = rc.constraint_schema and kc.constraint_name = rc.constraint_name
            where kc.table_schema = ${
              this.quoteString(database)
            }
              and kc.table_name = ${
              this.quoteString(table)
            }
              and kc.referenced_table_name is not null
            group by kc.constraint_name, kc.referenced_table_schema, kc.referenced_table_name, rc.update_rule,
                     rc.delete_rule`;

  }


  /*Compile a create table command.*/
  public compileCreate(blueprint: Blueprint, command: ColumnDefinition, connection: Connection) {
    let sql = this.compileCreateTable(blueprint, command, connection);
    sql     = this.compileCreateEncoding(sql, connection, blueprint);
    return [
      ...[this.compileCreateEngine(sql, connection, blueprint)],
      ...this.compileAutoIncrementStartingValues(blueprint)
    ].filter(it => !!it);
  }

  /*Create the main create table clause.*/
  protected compileCreateTable(blueprint: Blueprint, command: ColumnDefinition,
                               connection: Connection) {
    const tableStructure = this.getColumns(blueprint);

    const primaryKey = this.getCommandByName(blueprint, 'primaryKey');
    if (primaryKey) {
      tableStructure.push(`primary key ${
        primaryKey.algorithm ? 'using ' + primaryKey.algorithm : ''
      }(${
        this.columnize(primaryKey.columns)
      })`);

      primaryKey.shouldBeSkipped = true;
    }

    return (`${blueprint._temporary ? 'create temporary' : 'create'} table ${this.wrapTable(
      blueprint)} (${tableStructure.join(', ')})`).trim();
  }

  /*Append the character set specifications to a command.*/
  protected compileCreateEncoding(sql: string, connection: Connection, blueprint: Blueprint) {
    if (blueprint.charset !== undefined) {
      sql += ' default character set ' + blueprint.charset;
    } else {
      const charset = connection.getConfig('charset');
      if (!isBlank(charset)) {
        sql += ' default character set ' + charset;
      }
    }
    if (blueprint.collation !== undefined) {
      sql += ` collate '${blueprint.collation}'`;
    } else {
      const collation = connection.getConfig('collation');
      if (!isBlank(collation)) {
        sql += ` collate '${collation}'`;
      }
    }
    return sql;
  }

  /*Append the engine specifications to a command.*/
  protected compileCreateEngine(sql: string, connection: Connection, blueprint: Blueprint) {
    if (blueprint.engine !== undefined) {
      return sql + ' engine = ' + blueprint.engine;
    } else {
      const engine = connection.getConfig('engine');
      if (!isBlank(engine)) {
        return sql + ' engine = ' + engine;
      }
    }
    return sql;
  }

  /*Compile an add column command.*/
  public compileAdd(blueprint: Blueprint, command: ColumnDefinition) {
    const columns = this.prefixArray('add', this.getColumns(blueprint));
    return [
      ...[`alter table ${this.wrapTable(blueprint)} ${columns.join(', ')}`],
      ...this.compileAutoIncrementStartingValues(blueprint)
    ];
  }

  /*Compile the auto-incrementing column starting values.*/
  public compileAutoIncrementStartingValues(blueprint: Blueprint) {
    return blueprint.autoIncrementingStartingValues().map((value, column) => {
      return 'alter table ' + this.wrapTable(blueprint.getTable()) + ' auto_increment = ' + value;
    });
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
    // const version = connection.getServerVersion();
    //
    // if ((connection.isMaria() && version_compare(version, '10.5.2', '<')) ||
    //   (!connection.isMaria() && version_compare(version, '8.0.3', '<'))) {
    //   return this.compileLegacyRenameColumn(blueprint, command, connection);
    // }

    return super.compileRenameColumn(blueprint, command, connection);
  }

// /**
//  * Compile a rename column command for legacy versions of MySQL.
//  *
//  * @param  \Illuminate\Database\Schema\Blueprint  $blueprint
//  * @param  \Illuminate\Support\Fluent  $command
//  * @param  \Illuminate\Database\Connection  $connection
//  * @return string
//  */
// protected  compileLegacyRenameColumn(blueprint: Blueprint, command: ColumnDefinition, connection: Connection)
// {
//   $column = collect($connection.getSchemaBuilder().getColumns($blueprint.getTable()))
// .firstWhere('name', $command.from);
//
//   $modifiers = $this.addModifiers($column['type'], $blueprint, new ColumnDefinition([
//     'change' => true,
//   'type' => match ($column['type_name']) {
//   'bigint' => 'bigInteger',
//     'int' => 'integer',
//     'mediumint' => 'mediumInteger',
//     'smallint' => 'smallInteger',
//     'tinyint' => 'tinyInteger',
// default => $column['type_name'],
// },
//   'nullable' => $column['nullable'],
//   'default' => $column['default'] && (str_starts_with(strtolower($column['default']), 'current_timestamp') || $column['default'] === 'NULL')
//   ? new Expression($column['default'])
//   : $column['default'],
//   'autoIncrement' => $column['auto_increment'],
//   'collation' => $column['collation'],
//   'comment' => $column['comment'],
//   'virtualAs' => ! is_null($column['generation']) && $column['generation']['type'] === 'virtual'
//   ? $column['generation']['expression'] : null,
//   'storedAs' => ! is_null($column['generation']) && $column['generation']['type'] === 'stored'
//   ? $column['generation']['expression'] : null,
// ]));
//
//   return sprintf('alter table %s change %s %s %s',
//     $this.wrapTable($blueprint),
//     $this.wrap($command.from),
//     $this.wrap($command.to),
//     $modifiers
//   );
// }

  /**
   * Compile a change column command into a series of SQL statements.
   *
   * @param  \Illuminate\Database\Schema\Blueprint  $blueprint
   * @param  \Illuminate\Support\Fluent  $command
   * @param  \Illuminate\Database\Connection  $connection
   * @return array|string
   *
   * @throws \RuntimeException
   */
  public compileChange(blueprint: Blueprint, command: ColumnDefinition, connection: Connection) {
    const columns = [];

    for (const column of blueprint.getChangedColumns()) {
      columns.push(
        this.addModifiers(`
      ${
          isBlank(column.renameTo) ? 'modify' : 'change'
        } ${
          this.wrap(column)
        }${
          isBlank(column.renameTo) ? '' : ` (${this.wrap(column.renameTo)})`
        } ${
          this.getType(column)
        }`, blueprint, column)
      );
    }

    return `alter table ${this.wrapTable(blueprint)} ${columns.join(', ')}`;
  }

  /*Compile a primary key command.*/
  public compilePrimary(blueprint: Blueprint, command: ColumnDefinition) {
    return `alter table ${
      this.wrapTable(blueprint)
    } add primary key ${
        command.algorithm ? 'using ' + command.algorithm : ''
      }(${
        this.columnize(command.columns)
      })`;
  }

  /*Compile a unique key command.*/
  public compileUnique(blueprint: Blueprint, command: ColumnDefinition) {
    return this.compileKey(blueprint, command, 'unique');
  }

  /*Compile a plain index key command.*/
  public compileIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return this.compileKey(blueprint, command, 'index');
  }

  public compileFullText(blueprint: Blueprint, command: ColumnDefinition) {
    return this.compileKey(blueprint, command, 'fulltext');
  }

  /*Compile a spatial index key command.*/
  public compileSpatialIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return this.compileKey(blueprint, command, 'spatial index');
  }

  /*Compile an index creation command.*/
  protected compileKey(blueprint: Blueprint, command: ColumnDefinition, type: string) {
    return `alter table ` + `${this.wrapTable(blueprint)} add ${type} ${
      this.wrap(command.index)}${command.algorithm ?
      ` using ${command.algorithm}` : ''
    }(${this.columnize(command.columns)})`;
  }

  /*Compile a drop table command.*/
  public compileDrop(blueprint: Blueprint, command: ColumnDefinition) {
    return 'drop table ' + this.wrapTable(blueprint);
  }

  /*Compile a drop table (if exists) command.*/
  public compileDropIfExists(blueprint: Blueprint, command: ColumnDefinition) {
    return 'drop table if exists ' + this.wrapTable(blueprint);
  }

  /*Compile a drop column command.*/
  public compileDropColumn(blueprint: Blueprint, command: ColumnDefinition) {
    const columns = this.prefixArray('drop', this.wrapArray(command.columns));
    return 'alter table ' + this.wrapTable(blueprint) + ' ' + columns.join(', ');
  }

  /*Compile a drop primary key command.*/
  public compileDropPrimary(blueprint: Blueprint, command: ColumnDefinition) {
    return 'alter table ' + this.wrapTable(blueprint) + ' drop primary key';
  }

  /*Compile a drop unique key command.*/
  public compileDropUnique(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return `alter table ${this.wrapTable(blueprint)} drop index ${index}`;
  }

  /*Compile a drop index command.*/
  public compileDropIndex(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return `alter table ${this.wrapTable(blueprint)} drop index ${index}`;
  }

  public compileDropFullText(blueprint: Blueprint, command: ColumnDefinition) {
    return this.compileDropIndex(blueprint, command);
  }

  /*Compile a drop spatial index command.*/
  public compileDropSpatialIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return this.compileDropIndex(blueprint, command);
  }

  /*Compile a drop foreign key command.*/
  public compileDropForeign(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return `alter table ${this.wrapTable(blueprint)} drop foreign key ${index}`;
  }

  /*Compile a rename table command.*/
  public compileRename(blueprint: Blueprint, command: ColumnDefinition) {
    const from = this.wrapTable(blueprint);
    return `rename table ${from} to ${this.wrapTable(command.to)}`;
  }

  /*Compile a rename index command.*/
  public compileRenameIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return `alter table ${this.wrapTable(blueprint)} rename index ${this.wrap(
      command.from)} to ${this.wrap(command.to)}`;
  }

  /*Compile the SQL needed to drop all tables.*/
  public compileDropAllTables(tables: any[]) {
    return `drop table ${this.wrapArray(tables).join(',')}`;
  }

  /*Compile the SQL needed to drop all views.*/
  public compileDropAllViews(views: any[]) {
    return `drop view ${this.wrapArray(views).join(',')}`;
  }

  /*Compile the command to enable foreign key constraints.*/
  public compileEnableForeignKeyConstraints() {
    return 'SET FOREIGN_KEY_CHECKS=1;';
  }

  /*Compile the command to disable foreign key constraints.*/
  public compileDisableForeignKeyConstraints() {
    return 'SET FOREIGN_KEY_CHECKS=0;';
  }

  public compileTableComment(blueprint: Blueprint, command: ColumnDefinition) {
    return `alter table ${
      this.wrapTable(blueprint)
    } comment = ${
      `'${command.comment.replace(/'/g, '\'\'')}'`
    }`;
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
    return 'tinytext';
  }

  /*Create the column definition for a text type.*/
  protected typeText(column: ColumnDefinition) {
    return 'text';
  }

  /*Create the column definition for a medium text type.*/
  protected typeMediumText(column: ColumnDefinition) {
    return 'mediumtext';
  }

  /*Create the column definition for a long text type.*/
  protected typeLongText(column: ColumnDefinition) {
    return 'longtext';
  }

  /*Create the column definition for a big integer type.*/
  protected typeBigInteger(column: ColumnDefinition) {
    return 'bigint';
  }

  /*Create the column definition for an integer type.*/
  protected typeInteger(column: ColumnDefinition) {
    return 'int';
  }

  /*Create the column definition for a medium integer type.*/
  protected typeMediumInteger(column: ColumnDefinition) {
    return 'mediumint';
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
    return this.typeDouble(column);
  }

  /*Create the column definition for a double type.*/
  protected typeDouble(column: ColumnDefinition) {
    if (column.total && column.places) {
      return `double(${column.total}, ${column.places})`;
    }
    return 'double';
  }

  /*Create the column definition for a decimal type.*/
  protected typeDecimal(column: ColumnDefinition) {
    return `decimal(${column.total}, ${column.places})`;
  }

  /*Create the column definition for a boolean type.*/
  protected typeBoolean(column: ColumnDefinition) {
    return 'tinyint(1)';
  }

  /*Create the column definition for an enumeration type.*/
  protected typeEnum(column: ColumnDefinition) {
    return `enum(${this.quoteString(column.allowed)})`;
  }

  /*Create the column definition for a set enumeration type.*/
  protected typeSet(column: ColumnDefinition) {
    return `set(${this.quoteString(column.allowed)})`;
  }

  /*Create the column definition for a json type.*/
  protected typeJson(column: ColumnDefinition) {
    return 'json';
  }

  /*Create the column definition for a jsonb type.*/
  protected typeJsonb(column: ColumnDefinition) {
    return 'json';
  }

  /*Create the column definition for a date type.*/
  protected typeDate(column: ColumnDefinition) {
    return 'date';
  }

  /*Create the column definition for a date-time type.*/
  protected typeDateTime(column: ColumnDefinition) {
    let columnType = column.precision ? `datetime(${column.precision})` : 'datetime';
    const current  = column.precision ? `CURRENT_TIMESTAMP(${column.precision})` : 'CURRENT_TIMESTAMP';
    columnType     = column.useCurrent ? `${columnType} default ${current}` : columnType;
    return column.useCurrentOnUpdate ? `${columnType} on update ${current}` : columnType;
  }

  /*Create the column definition for a date-time (with time zone) type.*/
  protected typeDateTimeTz(column: ColumnDefinition) {
    return this.typeDateTime(column);
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
    let columnType = column.precision ? `timestamp(${column.precision})` : 'timestamp';
    const current  = column.precision ? `CURRENT_TIMESTAMP(${column.precision})` : 'CURRENT_TIMESTAMP';
    columnType     = column.useCurrent ? `${columnType} default ${current}` : columnType;
    return column.useCurrentOnUpdate ? `${columnType} on update ${current}` : columnType;
  }

  /*Create the column definition for a timestamp (with time zone) type.*/
  protected typeTimestampTz(column: ColumnDefinition) {
    return this.typeTimestamp(column);
  }

  /*Create the column definition for a year type.*/
  protected typeYear(column: ColumnDefinition) {
    return 'year';
  }

  /*Create the column definition for a binary type.*/
  protected typeBinary(column: ColumnDefinition) {
    return 'blob';
  }

  /*Create the column definition for a uuid type.*/
  protected typeUuid(column: ColumnDefinition) {
    return 'char(36)';
  }

  /*Create the column definition for an IP address type.*/
  protected typeIpAddress(column: ColumnDefinition) {
    return 'varchar(45)';
  }

  /*Create the column definition for a MAC address type.*/
  protected typeMacAddress(column: ColumnDefinition) {
    return 'varchar(17)';
  }

  /*Create the column definition for a spatial Geometry type.*/
  public typeGeometry(column: ColumnDefinition) {
    return 'geometry';
  }

  /*Create the column definition for a spatial Point type.*/
  public typePoint(column: ColumnDefinition) {
    return 'point';
  }

  /*Create the column definition for a spatial LineString type.*/
  public typeLineString(column: ColumnDefinition) {
    return 'linestring';
  }

  /*Create the column definition for a spatial Polygon type.*/
  public typePolygon(column: ColumnDefinition) {
    return 'polygon';
  }

  /*Create the column definition for a spatial GeometryCollection type.*/
  public typeGeometryCollection(column: ColumnDefinition) {
    return 'geometrycollection';
  }

  /*Create the column definition for a spatial MultiPoint type.*/
  public typeMultiPoint(column: ColumnDefinition) {
    return 'multipoint';
  }

  /*Create the column definition for a spatial MultiLineString type.*/
  public typeMultiLineString(column: ColumnDefinition) {
    return 'multilinestring';
  }

  /*Create the column definition for a spatial MultiPolygon type.*/
  public typeMultiPolygon(column: ColumnDefinition) {
    return 'multipolygon';
  }

  /*Create the column definition for a generated, computed column type.*/
  protected typeComputed(column: ColumnDefinition) {
    throw new Error(
      'RuntimeException This database driver requires a type, see the virtualAs / storedAs modifiers.');
  }

  /*Get the SQL for a generated virtual column modifier.*/
  protected modifyVirtualAs(blueprint: Blueprint, column: ColumnDefinition) {
    let virtualAs = column.virtualAsJson;
    if (!isBlank(virtualAs)) {
      if (this.isJsonSelector(virtualAs)) {
        virtualAs = this.wrapJsonSelector(virtualAs);
      }
      return ` as (${virtualAs})`;
    }
    if (!isBlank(virtualAs = column.virtualAs)) {
      return ` as (${virtualAs})`;
    }

    return '';
  }

  /*Get the SQL for a generated stored column modifier.*/
  protected modifyStoredAs(blueprint: Blueprint, column: ColumnDefinition) {
    let storedAs = column.storedAsJson;
    if (!isBlank(storedAs)) {
      if (this.isJsonSelector(storedAs)) {
        storedAs = this.wrapJsonSelector(storedAs);
      }
      return ` as (${storedAs}) stored`;
    }
    if (!isBlank(storedAs = column.storedAs)) {
      return ` as (${storedAs}) stored`;
    }

    return '';
  }

  /*Get the SQL for an unsigned column modifier.*/
  protected modifyUnsigned(blueprint: Blueprint, column: ColumnDefinition) {
    if (column.unsigned) {
      return ' unsigned';
    }
    return '';
  }

  /*Get the SQL for a character set column modifier.*/
  protected modifyCharset(blueprint: Blueprint, column: ColumnDefinition) {
    if (!isBlank(column.charset)) {
      return ' character set ' + column.charset;
    }
    return '';
  }

  /*Get the SQL for a collation column modifier.*/
  protected modifyCollate(blueprint: Blueprint, column: ColumnDefinition) {
    if (!isBlank(column.collation)) {
      return ` collate '${column.collation}'`;
    }
    return '';
  }

  /*Get the SQL for a nullable column modifier.*/
  protected modifyNullable(blueprint: Blueprint, column: ColumnDefinition) {
    if (isBlank(column.virtualAs) && isBlank(column.virtualAsJson) && isBlank(
      column.storedAs) && isBlank(column.storedAsJson)) {
      return column.nullable ? ' null' : ' not null';
    }
    if (column.nullable === false) {
      return ' not null';
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
      return ' auto_increment primary key';
    }

    return '';
  }

  /*Get the SQL for a "first" column modifier.*/
  protected modifyFirst(blueprint: Blueprint, column: ColumnDefinition) {
    if (!isBlank(column.first)) {
      return ' first';
    }
    return '';
  }

  /*Get the SQL for an "after" column modifier.*/
  protected modifyAfter(blueprint: Blueprint, column: ColumnDefinition) {
    if (!isBlank(column.after)) {
      return ' after ' + this.wrap(column.after);
    }
    return '';
  }

  /*Get the SQL for a "comment" column modifier.*/
  protected modifyComment(blueprint: Blueprint, column: ColumnDefinition) {
    if (!isBlank(column.comment)) {
      return ` comment '${column.comment.replace(/'/g, '\\\'')}'`;
    }
    return '';
  }

  /*Get the SQL for a SRID column modifier.*/
  protected modifySrid(blueprint: Blueprint, column: ColumnDefinition) {
    if (!isBlank(column.srid) && isNumber(column.srid) && column.srid > 0) {
      return ' srid ' + column.srid;
    }
    return '';
  }

  /*Wrap a single string in keyword identifiers.*/
  protected wrapValue(value: string) {
    if (value !== '*') {
      return '`' + value.replace(/`/g, '``') + '`';
    }
    return value;
  }

  /*Wrap the given JSON selector.*/
  protected wrapJsonSelector(value: string) {
    const [field, path] = this.wrapJsonFieldAndPath(value);
    return 'json_unquote(json_extract(' + field + path + '))';
  }

}
