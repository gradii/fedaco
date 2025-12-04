/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { camelCase, isBlank, partition } from '@gradii/nanofn';
import type { Connection } from '../../connection';
import type { Blueprint } from '../blueprint';
import { ColumnDefinition } from '../column-definition';
import { ForeignKeyDefinition } from '../foreign-key-definition';
import { IndexDefinition } from '../index-definition';
import { SchemaGrammar } from './schema-grammar';

export class SqliteSchemaGrammar extends SchemaGrammar {
  /* The possible column modifiers. */
  protected modifiers: string[] = ['Increment', 'Nullable', 'Default', 'Collate', 'VirtualAs', 'StoredAs'];
  /* The columns available as serials. */
  protected serials: string[] = ['bigInteger', 'integer', 'mediumInteger', 'smallInteger', 'tinyInteger'];

  public compileSqlCreateStatement(name: string, type = 'table') {
    return `select "sql" from sqlite_master
            where type = '${type.replace(/['"]/g, '')}'
              and name = '${name.replace(/\./g, '__').replace(/['"]/g, '')}'`;
  }

  /**
   * Compile the query to determine if the dbstat table is available.
   *
   * @return string
   */
  public compileDbstatExists() {
    return "select exists (select 1 from pragma_compile_options where compile_options = 'ENABLE_DBSTAT_VTAB') as enabled";
  }

  /**
   * Compile the query to determine the tables.
   *
   * @param withSize
   * @return string
   */
  public compileTables(withSize = false) {
    return withSize
      ? `select m.tbl_name as name, sum(s.pgsize) as size
         from sqlite_master as m join dbstat as s
         on s.name = m.name
         where m.type in ('table', 'index') and m.tbl_name not like 'sqlite_%'
         group by m.tbl_name
         order by m.tbl_name`
      : `select name
         from sqlite_master
         where type = 'table'
           and name not like 'sqlite_%'
         order by name`;
  }

  /**
   * Compile the query to determine the views.
   *
   * @return string
   */
  public compileViews() {
    return "select name, sql as definition from sqlite_master where type = 'view' order by name";
  }

  public compileColumns(table: string): string {
    return `select name,
                   type,
                   not "notnull" as "nullable",
                   dflt_value    as "default",
                   pk            as "primary",
                   hidden        as "extra"
            from pragma_table_xinfo(${this.quoteString(table.replace(/\./g, '__'))})
            order by cid asc`;
  }

  public compileIndexes(table: string) {
    table = this.quoteString(table.replace(/\./g, '__'));
    return `select 'primary' as name, group_concat(col) as columns, 1 as "unique", 1 as "primary"
            from (select name as col
                  from pragma_table_info(${table})
                  where pk > 0
                  order by pk, cid)
            group by name
            union
            select name, group_concat(col) as columns, "unique", origin = 'pk' as "primary"
            from (select il.*, ii.name as col
                  from pragma_index_list(${table}) il,
                       pragma_index_info(il.name) ii
                  order by il.seq, ii.seqno)
            group by name, "unique", "primary"`;
  }

  public compileForeignKeys(table: string) {
    return `select group_concat("from") as columns,
                   "table"              as foreign_table,
                   group_concat("to")   as foreign_columns,
                   on_update,
                   on_delete
            from (select * from pragma_foreign_key_list(${this.quoteString(
              table.replace(/\./g, '__'),
            )}) order by id desc, seq)
            group by id, "table", on_update, on_delete`;
  }

  /* Compile a create table command. */
  public compileCreate(blueprint: Blueprint, command: ColumnDefinition) {
    return `${blueprint._temporary ? 'create temporary' : 'create'} table ${this.wrapTable(
      blueprint,
    )} (${this.getColumns(blueprint).join(', ')}${this.addForeignKeys(
      this.getCommandsByName(blueprint, 'foreign'),
    )}${this.addPrimaryKeys(this.getCommandByName(blueprint, 'primary'))})`;
  }

  /* Get the foreign key syntax for a table creation statement. */
  protected addForeignKeys(foreignKeys: ForeignKeyDefinition[]) {
    return foreignKeys.reduce((sql, foreign) => {
      sql += this.getForeignKey(foreign);
      return sql;
    }, '');
  }

  /* Get the SQL for the foreign key. */
  protected getForeignKey(foreign: ForeignKeyDefinition) {
    return `, foreign key(${this.columnize(foreign.columns)}) references ${this.wrapTable(
      foreign.on,
    )}(${this.columnize(/* cast type array */ foreign.references)})`;
  }

  /* Get the primary key syntax for a table creation statement. */
  protected addPrimaryKeys(primary: ColumnDefinition) {
    if (!isBlank(primary)) {
      return `, primary key (${this.columnize(primary.columns)})`;
    }
    return '';
  }

  /* Compile alter table commands for adding columns. */
  public compileAdd(blueprint: Blueprint, command: ColumnDefinition) {
    const columns = this.prefixArray('add column', this.getColumns(blueprint));
    return columns
      .filter((column) => {
        return !/as \(.*\) stored/.exec(column);
      })
      .map((column) => {
        return `alter table ${this.wrapTable(blueprint)} ${column}`;
      });
  }

  /**
   * Compile a change column command into a series of SQL statements.
   *
   * @throws \RuntimeException
   */
  public async compileChange(blueprint: Blueprint, command: ColumnDefinition, connection: Connection) {
    const schema = connection.getSchemaBuilder();
    const table = blueprint.getTable();

    const changedColumns = blueprint.getChangedColumns();
    const columnNames: string[] = [];
    let autoIncrementColumn: any;

    const columns = (await schema.getColumns(table)).map((column) => {
      column = changedColumns.find((col) => col.name === column['name']) || column;

      if (column instanceof ColumnDefinition) {
        const name = this.wrap(column);
        autoIncrementColumn = column.autoIncrement ? column.name : autoIncrementColumn;

        if (
          isBlank(column.virtualAs) &&
          isBlank(column.virtualAsJson) &&
          isBlank(column.storedAs) &&
          isBlank(column.storedAsJson)
        ) {
          columnNames.push(name);
        }

        return this.addModifiers(name + ' ' + this.getType(column), blueprint, column);
      } else {
        const name = this.wrap(column['name']);
        autoIncrementColumn = column['auto_increment'] ? column['name'] : autoIncrementColumn;
        const isGenerated = !isBlank(column['generation']);

        if (!isGenerated) {
          columnNames.push(name);
        }

        return this.addModifiers(
          name + ' ' + column['type'],
          blueprint,
          new ColumnDefinition({
            change       : true,
            type         : column['type_name'],
            nullable     : column['nullable'],
            default      : column['default'] ? column['default'] : null,
            autoIncrement: column['auto_increment'],
            collation    : column['collation'],
            comment      : column['comment'],
            virtualAs:
              isGenerated && column['generation']['type'] === 'virtual' ? column['generation']['expression'] : null,
            storedAs:
              isGenerated && column['generation']['type'] === 'stored' ? column['generation']['expression'] : null,
          }),
        );
      }
    });

    const foreignKeys = (await schema.getForeignKeys(table)).map(
      (foreignKey) =>
        new ForeignKeyDefinition({
          columns   : foreignKey['columns'],
          on        : foreignKey['foreign_table'],
          references: foreignKey['foreign_columns'],
          onUpdate  : foreignKey['on_update'],
          onDelete  : foreignKey['on_delete'],
        }),
    );

    let primary = [],
      indexes = [];
    [primary, indexes] = partition(
      (await schema.getIndexes(table)).map(
        (index: ColumnDefinition) =>
          new IndexDefinition({
            name   : index['primary'] ? 'primary' : index['unique'] ? 'unique' : 'index',
            index  : index['name'],
            columns: index['columns'],
          }),
      ),
      (index) => index['name'] === 'primary',
    );

    indexes = indexes
      .filter((index) => !index['index'].startsWith('sqlite_'))
      .map(
        // @ts-ignore
        (index) => this['compile' + camelCase(index.name)](blueprint, index),
      );

    const tempTable = this.wrap('__temp__' + blueprint.getPrefix() + table);
    const tableStr = this.wrapTable(blueprint);
    const columnNamesStr = columnNames.join(', ');

    const foreignKeyConstraintsEnabled = await connection.scalar('pragma foreign_keys');

    const sqls = [];
    if (foreignKeyConstraintsEnabled) {
      sqls.push(this.compileDisableForeignKeyConstraints());
    }
    sqls.push(
      `create table ${tempTable}
        ${columns.join(', ')}${this.addForeignKeys(foreignKeys)}${
          autoIncrementColumn ? '' : this.addPrimaryKeys(primary[0])
        }`,
      `insert into ${tempTable} (${columnNamesStr})
       select ${columnNamesStr}
       from ${tableStr}`,
      `drop table ${tableStr}`,
      `alter table ${tempTable} rename to ${tableStr}`,
    );
    sqls.push(...indexes);
    if (foreignKeyConstraintsEnabled) {
      sqls.push(this.compileEnableForeignKeyConstraints());
    }
    return sqls;
  }

  /* Compile a unique key command. */
  public compileUnique(blueprint: Blueprint, command: ColumnDefinition) {
    return (
      'create unique index ' +
      `${this.wrap(command.index)} on ${this.wrapTable(blueprint)} (${this.columnize(command.columns)})`
    );
  }

  /* Compile a plain index key command. */
  public compileIndex(blueprint: Blueprint, command: ColumnDefinition) {
    return (
      'create index ' +
      `${this.wrap(command.index)} on ${this.wrapTable(blueprint)} (${this.columnize(command.columns)})`
    );
  }

  /* Compile a spatial index key command. */
  public compileSpatialIndex(blueprint: Blueprint, command: ColumnDefinition) {
    throw new Error('RuntimeException The database driver in use does not support spatial indexes.');
  }

  /* Compile a foreign key command. */
  public compileForeign(blueprint: Blueprint, command: ColumnDefinition): string {
    return '';
  }

  /* Compile a drop table command. */
  public compileDrop(blueprint: Blueprint, command: ColumnDefinition) {
    return `drop table ${this.wrapTable(blueprint)}`;
  }

  /* Compile a drop table (if exists) command. */
  public compileDropIfExists(blueprint: Blueprint, command: ColumnDefinition) {
    return `drop table if exists ${this.wrapTable(blueprint)}`;
  }

  /* Compile the SQL needed to drop all tables. */
  public compileDropAllTables() {
    return 'delete from sqlite_master where type in ' + `('table', 'index', 'trigger')`;
  }

  /* Compile the SQL needed to drop all views. */
  public compileDropAllViews() {
    return 'delete from sqlite_master where type in ' + `('view')`;
  }

  /* Compile the SQL needed to rebuild the database. */
  public compileRebuild() {
    return 'vacuum';
  }

  /* Compile a drop column command. */
  public compileDropColumn(blueprint: Blueprint, command: ColumnDefinition, connection: Connection) {
    const table = this.wrapTable(blueprint);
    const columns = this.prefixArray('drop column', this.wrapArray(command.columns));
    return columns.map((it) => `alter table ${table} ${it}`);
  }

  /* Compile a drop unique key command. */
  public compileDropUnique(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return 'drop index ' + `${index}`;
  }

  /* Compile a drop index command. */
  public compileDropIndex(blueprint: Blueprint, command: ColumnDefinition) {
    const index = this.wrap(command.index);
    return 'drop index ' + `${index}`;
  }

  /* Compile a drop spatial index command. */
  public compileDropSpatialIndex(blueprint: Blueprint, command: ColumnDefinition) {
    throw new Error('RuntimeException The database driver in use does not support spatial indexes.');
  }

  /* Compile a rename table command. */
  public compileRename(blueprint: Blueprint, command: ColumnDefinition) {
    const from = this.wrapTable(blueprint);
    return `alter table ${from} rename to ${this.wrapTable(command.to)}`;
  }

  /* Compile a rename index command. */
  public async compileRenameIndex(blueprint: Blueprint, command: ColumnDefinition, connection: Connection) {
    const indexes = await connection.getSchemaBuilder().getIndexes(blueprint.getTable());
    const index = indexes.find((index) => index.name === command.from);
    if (!index) {
      throw new Error(`Index [${command.from}] does not exist.`);
    }
    if (index['primary']) {
      throw new Error('SQLite does not support altering primary keys.');
    }

    if (index['unique']) {
      return [
        this.compileDropUnique(blueprint, new ColumnDefinition({ index: index['name'] })),
        this.compileUnique(blueprint, new ColumnDefinition({ index: command.to, columns: index['columns'] })),
      ];
    }

    return [
      this.compileDropIndex(blueprint, new ColumnDefinition({ index: index['name'] })),
      this.compileIndex(blueprint, new ColumnDefinition({ index: command.to, columns: index['columns'] })),
    ];
  }

  /* Compile the command to enable foreign key constraints. */
  public compileEnableForeignKeyConstraints() {
    return 'PRAGMA foreign_keys = ON;';
  }

  /* Compile the command to disable foreign key constraints. */
  public compileDisableForeignKeyConstraints() {
    return 'PRAGMA foreign_keys = OFF;';
  }

  /* Compile the SQL needed to enable a writable schema. */
  public compileEnableWriteableSchema() {
    return 'PRAGMA writable_schema = 1;';
  }

  /* Compile the SQL needed to disable a writable schema. */
  public compileDisableWriteableSchema() {
    return 'PRAGMA writable_schema = 0;';
  }

  /* Create the column definition for a char type. */
  protected typeChar(column: ColumnDefinition) {
    return 'varchar';
  }

  /* Create the column definition for a string type. */
  protected typeString(column: ColumnDefinition) {
    return 'varchar';
  }

  /* Create the column definition for a tiny text type. */
  protected typeTinyText(column: ColumnDefinition) {
    return 'text';
  }

  /* Create the column definition for a text type. */
  protected typeText(column: ColumnDefinition) {
    return 'text';
  }

  /* Create the column definition for a medium text type. */
  protected typeMediumText(column: ColumnDefinition) {
    return 'text';
  }

  /* Create the column definition for a long text type. */
  protected typeLongText(column: ColumnDefinition) {
    return 'text';
  }

  /* Create the column definition for an integer type. */
  protected typeInteger(column: ColumnDefinition) {
    return 'integer';
  }

  /* Create the column definition for a big integer type. */
  protected typeBigInteger(column: ColumnDefinition) {
    return 'integer';
  }

  /* Create the column definition for a medium integer type. */
  protected typeMediumInteger(column: ColumnDefinition) {
    return 'integer';
  }

  /* Create the column definition for a tiny integer type. */
  protected typeTinyInteger(column: ColumnDefinition) {
    return 'integer';
  }

  /* Create the column definition for a small integer type. */
  protected typeSmallInteger(column: ColumnDefinition) {
    return 'integer';
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
    return 'numeric';
  }

  /* Create the column definition for a boolean type. */
  protected typeBoolean(column: ColumnDefinition) {
    return 'tinyint(1)';
  }

  /* Create the column definition for an enumeration type. */
  protected typeEnum(column: ColumnDefinition) {
    return `varchar check ("${column.name}" in (${this.quoteString(column.allowed)}))`;
  }

  /* Create the column definition for a json type. */
  protected typeJson(column: ColumnDefinition) {
    return 'text';
  }

  /* Create the column definition for a jsonb type. */
  protected typeJsonb(column: ColumnDefinition) {
    return 'text';
  }

  /* Create the column definition for a date type. */
  protected typeDate(column: ColumnDefinition) {
    return 'date';
  }

  /* Create the column definition for a date-time type. */
  protected typeDateTime(column: ColumnDefinition) {
    return this.typeTimestamp(column);
  }

  /* Create the column definition for a date-time (with time zone) type.

  Note: "SQLite does not have a storage class set aside for storing dates and/or times." */
  protected typeDateTimeTz(column: ColumnDefinition) {
    return this.typeDateTime(column);
  }

  /* Create the column definition for a time type. */
  protected typeTime(column: ColumnDefinition) {
    return 'time';
  }

  /* Create the column definition for a time (with time zone) type. */
  protected typeTimeTz(column: ColumnDefinition) {
    return this.typeTime(column);
  }

  /* Create the column definition for a timestamp type. */
  protected typeTimestamp(column: ColumnDefinition) {
    return column.useCurrent ? 'datetime default CURRENT_TIMESTAMP' : 'datetime';
  }

  /* Create the column definition for a timestamp (with time zone) type. */
  protected typeTimestampTz(column: ColumnDefinition) {
    return this.typeTimestamp(column);
  }

  /* Create the column definition for a year type. */
  protected typeYear(column: ColumnDefinition) {
    return this.typeInteger(column);
  }

  /* Create the column definition for a binary type. */
  protected typeBinary(column: ColumnDefinition) {
    return 'blob';
  }

  /* Create the column definition for a uuid type. */
  protected typeUuid(column: ColumnDefinition) {
    return 'varchar';
  }

  /* Create the column definition for an IP address type. */
  protected typeIpAddress(column: ColumnDefinition) {
    return 'varchar';
  }

  /* Create the column definition for a MAC address type. */
  protected typeMacAddress(column: ColumnDefinition) {
    return 'varchar';
  }

  /* Create the column definition for a spatial Geometry type. */
  public typeGeometry(column: ColumnDefinition) {
    return 'geometry';
  }

  protected typeGeography(column: ColumnDefinition) {
    return this.typeGeometry(column);
  }

  /* Create the column definition for a generated, computed column type. */
  protected typeComputed(column: ColumnDefinition) {
    throw new Error('RuntimeException This database driver requires a type, see the virtualAs / storedAs modifiers.');
  }

  /* Create the column definition for a spatial Point type. */
  public typePoint(column: ColumnDefinition) {
    return 'point';
  }

  /* Create the column definition for a spatial LineString type. */
  public typeLineString(column: ColumnDefinition) {
    return 'linestring';
  }

  /* Create the column definition for a spatial Polygon type. */
  public typePolygon(column: ColumnDefinition) {
    return 'polygon';
  }

  /* Create the column definition for a spatial GeometryCollection type. */
  public typeGeometryCollection(column: ColumnDefinition) {
    return 'geometrycollection';
  }

  /* Create the column definition for a spatial MultiPoint type. */
  public typeMultiPoint(column: ColumnDefinition) {
    return 'multipoint';
  }

  /* Create the column definition for a spatial MultiLineString type. */
  public typeMultiLineString(column: ColumnDefinition) {
    return 'multilinestring';
  }

  /* Create the column definition for a spatial MultiPolygon type. */
  public typeMultiPolygon(column: ColumnDefinition) {
    return 'multipolygon';
  }

  /* Get the SQL for a generated virtual column modifier. */
  protected modifyVirtualAs(blueprint: Blueprint, column: ColumnDefinition) {
    let virtualAs = column.virtualAsJson;
    if (!isBlank(virtualAs)) {
      if (this.isJsonSelector(virtualAs)) {
        virtualAs = this.wrapJsonSelector(virtualAs);
      }
      return ` as (${virtualAs})`;
    }
    virtualAs = column.virtualAs;
    if (!isBlank(virtualAs)) {
      return ` as (${virtualAs})`;
    }

    return '';
  }

  /* Get the SQL for a generated stored column modifier. */
  protected modifyStoredAs(blueprint: Blueprint, column: ColumnDefinition) {
    let storedAs = column.storedAsJson;
    if (!isBlank(storedAs)) {
      if (this.isJsonSelector(storedAs)) {
        storedAs = this.wrapJsonSelector(storedAs);
      }
      return ` as (${storedAs}) stored`;
    }
    storedAs = column.storedAs;
    if (!isBlank(storedAs)) {
      return ` as (${column.storedAs}) stored`;
    }
    return '';
  }

  /* Get the SQL for a nullable column modifier. */
  protected modifyNullable(blueprint: Blueprint, column: ColumnDefinition) {
    if (
      isBlank(column.virtualAs) &&
      isBlank(column.virtualAsJson) &&
      isBlank(column.storedAs) &&
      isBlank(column.storedAsJson)
    ) {
      return column.nullable ? '' : ' not null';
    }
    if (column.nullable === false) {
      return ' not null';
    }

    return '';
  }

  /* Get the SQL for a default column modifier. */
  protected modifyDefault(blueprint: Blueprint, column: ColumnDefinition) {
    if (
      !isBlank(column.default) &&
      isBlank(column.virtualAs) &&
      isBlank(column.virtualAsJson) &&
      isBlank(column.storedAs)
    ) {
      return ' default ' + this.getDefaultValue(column.default);
    }
    return '';
  }

  /* Get the SQL for an auto-increment column modifier. */
  protected modifyIncrement(blueprint: Blueprint, column: ColumnDefinition) {
    if (this.serials.includes(column.type) && column.autoIncrement) {
      return ' primary key autoincrement';
    }
    return '';
  }

  protected modifyCollate(blueprint: Blueprint, column: ColumnDefinition) {
    if (!isBlank(column.collation)) {
      return ` collate '${column.collation}'`;
    }
    return '';
  }

  /* Wrap the given JSON selector. */
  protected wrapJsonSelector(value: string) {
    const [field, path] = this.wrapJsonFieldAndPath(value);
    return 'json_extract(' + field + path + ')';
  }
}
