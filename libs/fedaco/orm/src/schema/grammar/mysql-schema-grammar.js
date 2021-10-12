import { isBlank, isNumber } from '@gradii/check-type';
import { SchemaGrammar } from './schema-grammar';

export class MysqlSchemaGrammar extends SchemaGrammar {
  constructor() {
    super(...arguments);

    this.modifiers = [
      'Unsigned', 'Charset', 'Collate', 'VirtualAs', 'StoredAs', 'Nullable', 'Srid', 'Default',
      'Increment', 'Comment', 'After', 'First'
    ];

    this.serials = [
      'bigInteger', 'integer', 'mediumInteger', 'smallInteger', 'tinyInteger'
    ];
  }

  compileCreateDatabase(name, connection) {
    return `create database ${this.wrapValue(name)} default character set ${this.wrapValue(connection.getConfig('charset'))} default collate ${this.wrapValue(connection.getConfig('collation'))}`;
  }

  compileDropDatabaseIfExists(name) {
    return `drop database if exists ${this.wrapValue(name)}`;
  }

  compileTableExists() {
    return 'select * from information_schema.tables where table_schema = ? and table_name = ? and table_type = \'BASE TABLE\'';
  }

  compileColumnListing() {
    return 'select column_name as `column_name` from information_schema.columns where table_schema = ? and table_name = ?';
  }

  compileCreate(blueprint, command, connection) {
    let sql = this.compileCreateTable(blueprint, command, connection);
    sql = this.compileCreateEncoding(sql, connection, blueprint);
    return [
      ...[this.compileCreateEngine(sql, connection, blueprint)],
      ...this.compileAutoIncrementStartingValues(blueprint)
    ].filter(it => !!it);
  }

  compileCreateTable(blueprint, command, connection) {
    return (`${blueprint._temporary ? 'create temporary' : 'create'} table ${this.wrapTable(blueprint)} (${this.getColumns(blueprint).join(', ')})`).trim();
  }

  compileCreateEncoding(sql, connection, blueprint) {
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

  compileCreateEngine(sql, connection, blueprint) {
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

  compileAdd(blueprint, command) {
    const columns = this.prefixArray('add', this.getColumns(blueprint));
    return [
      ...[`alter table ${this.wrapTable(blueprint)} ${columns.join(', ')}`],
      ...this.compileAutoIncrementStartingValues(blueprint)
    ];
  }

  compileAutoIncrementStartingValues(blueprint) {
    return blueprint.autoIncrementingStartingValues().map((value, column) => {
      return 'alter table ' + this.wrapTable(blueprint.getTable()) + ' auto_increment = ' + value;
    });
  }

  compilePrimary(blueprint, command) {
    command.withName(null);
    return this.compileKey(blueprint, command, 'primary key');
  }

  compileUnique(blueprint, command) {
    return this.compileKey(blueprint, command, 'unique');
  }

  compileIndex(blueprint, command) {
    return this.compileKey(blueprint, command, 'index');
  }

  compileSpatialIndex(blueprint, command) {
    return this.compileKey(blueprint, command, 'spatial index');
  }

  compileKey(blueprint, command, type) {
    return `alter table ` + `${this.wrapTable(blueprint)} add ${type} ${this.wrap(command.index)}${command.algorithm ?
      ` using ${command.algorithm}` : ''}(${this.columnize(command.columns)})`;
  }

  compileDrop(blueprint, command) {
    return 'drop table ' + this.wrapTable(blueprint);
  }

  compileDropIfExists(blueprint, command) {
    return 'drop table if exists ' + this.wrapTable(blueprint);
  }

  compileDropColumn(blueprint, command) {
    const columns = this.prefixArray('drop', this.wrapArray(command.columns));
    return 'alter table ' + this.wrapTable(blueprint) + ' ' + columns.join(', ');
  }

  compileDropPrimary(blueprint, command) {
    return 'alter table ' + this.wrapTable(blueprint) + ' drop primary key';
  }

  compileDropUnique(blueprint, command) {
    const index = this.wrap(command.index);
    return `alter table ${this.wrapTable(blueprint)} drop index ${index}`;
  }

  compileDropIndex(blueprint, command) {
    const index = this.wrap(command.index);
    return `alter table ${this.wrapTable(blueprint)} drop index ${index}`;
  }

  compileDropSpatialIndex(blueprint, command) {
    return this.compileDropIndex(blueprint, command);
  }

  compileDropForeign(blueprint, command) {
    const index = this.wrap(command.index);
    return `alter table ${this.wrapTable(blueprint)} drop foreign key ${index}`;
  }

  compileRename(blueprint, command) {
    const from = this.wrapTable(blueprint);
    return `rename table ${from} to ${this.wrapTable(command.to)}`;
  }

  compileRenameIndex(blueprint, command) {
    return `alter table ${this.wrapTable(blueprint)} rename index ${this.wrap(command.from)} to ${this.wrap(command.to)}`;
  }

  compileDropAllTables(tables) {
    return `drop table ${this.wrapArray(tables).join(',')}`;
  }

  compileDropAllViews(views) {
    return `drop view ${this.wrapArray(views).join(',')}`;
  }

  compileGetAllTables() {
    return 'SHOW FULL TABLES WHERE table_type = \'BASE TABLE\'';
  }

  compileGetAllViews() {
    return 'SHOW FULL TABLES WHERE table_type = \'VIEW\'';
  }

  compileEnableForeignKeyConstraints() {
    return 'SET FOREIGN_KEY_CHECKS=1;';
  }

  compileDisableForeignKeyConstraints() {
    return 'SET FOREIGN_KEY_CHECKS=0;';
  }

  typeChar(column) {
    return `char(${column.length})`;
  }

  typeString(column) {
    return `varchar(${column.length})`;
  }

  typeTinyText(column) {
    return 'tinytext';
  }

  typeText(column) {
    return 'text';
  }

  typeMediumText(column) {
    return 'mediumtext';
  }

  typeLongText(column) {
    return 'longtext';
  }

  typeBigInteger(column) {
    return 'bigint';
  }

  typeInteger(column) {
    return 'int';
  }

  typeMediumInteger(column) {
    return 'mediumint';
  }

  typeTinyInteger(column) {
    return 'tinyint';
  }

  typeSmallInteger(column) {
    return 'smallint';
  }

  typeFloat(column) {
    return this.typeDouble(column);
  }

  typeDouble(column) {
    if (column.total && column.places) {
      return `double(${column.total}, ${column.places})`;
    }
    return 'double';
  }

  typeDecimal(column) {
    return `decimal(${column.total}, ${column.places})`;
  }

  typeBoolean(column) {
    return 'tinyint(1)';
  }

  typeEnum(column) {
    return `enum(${this.quoteString(column.allowed)})`;
  }

  typeSet(column) {
    return `set(${this.quoteString(column.allowed)})`;
  }

  typeJson(column) {
    return 'json';
  }

  typeJsonb(column) {
    return 'json';
  }

  typeDate(column) {
    return 'date';
  }

  typeDateTime(column) {
    let columnType = column.precision ? `datetime(${column.precision})` : 'datetime';
    const current = column.precision ? `CURRENT_TIMESTAMP(${column.precision})` : 'CURRENT_TIMESTAMP';
    columnType = column.useCurrent ? `${columnType} default ${current}` : columnType;
    return column.useCurrentOnUpdate ? `${columnType} on update ${current}` : columnType;
  }

  typeDateTimeTz(column) {
    return this.typeDateTime(column);
  }

  typeTime(column) {
    return column.precision ? `time(${column.precision})` : 'time';
  }

  typeTimeTz(column) {
    return this.typeTime(column);
  }

  typeTimestamp(column) {
    let columnType = column.precision ? `timestamp(${column.precision})` : 'timestamp';
    const current = column.precision ? `CURRENT_TIMESTAMP(${column.precision})` : 'CURRENT_TIMESTAMP';
    columnType = column.useCurrent ? `${columnType} default ${current}` : columnType;
    return column.useCurrentOnUpdate ? `${columnType} on update ${current}` : columnType;
  }

  typeTimestampTz(column) {
    return this.typeTimestamp(column);
  }

  typeYear(column) {
    return 'year';
  }

  typeBinary(column) {
    return 'blob';
  }

  typeUuid(column) {
    return 'char(36)';
  }

  typeIpAddress(column) {
    return 'varchar(45)';
  }

  typeMacAddress(column) {
    return 'varchar(17)';
  }

  typeGeometry(column) {
    return 'geometry';
  }

  typePoint(column) {
    return 'point';
  }

  typeLineString(column) {
    return 'linestring';
  }

  typePolygon(column) {
    return 'polygon';
  }

  typeGeometryCollection(column) {
    return 'geometrycollection';
  }

  typeMultiPoint(column) {
    return 'multipoint';
  }

  typeMultiLineString(column) {
    return 'multilinestring';
  }

  typeMultiPolygon(column) {
    return 'multipolygon';
  }

  typeComputed(column) {
    throw new Error('RuntimeException This database driver requires a type, see the virtualAs / storedAs modifiers.');
  }

  modifyVirtualAs(blueprint, column) {
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

  modifyStoredAs(blueprint, column) {
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

  modifyUnsigned(blueprint, column) {
    if (column.unsigned) {
      return ' unsigned';
    }
    return '';
  }

  modifyCharset(blueprint, column) {
    if (!isBlank(column.charset)) {
      return ' character set ' + column.charset;
    }
    return '';
  }

  modifyCollate(blueprint, column) {
    if (!isBlank(column.collation)) {
      return ` collate '${column.collation}'`;
    }
    return '';
  }

  modifyNullable(blueprint, column) {
    if (isBlank(column.virtualAs) && isBlank(column.virtualAsJson) && isBlank(column.storedAs) && isBlank(column.storedAsJson)) {
      return column.nullable ? ' null' : ' not null';
    }
    if (column.nullable === false) {
      return ' not null';
    }
    return '';
  }

  modifyDefault(blueprint, column) {
    if (!isBlank(column.default)) {
      return ' default ' + this.getDefaultValue(column.default);
    }
    return '';
  }

  modifyIncrement(blueprint, column) {
    if (this.serials.includes(column.type) && column.autoIncrement) {
      return ' auto_increment primary key';
    }
    return '';
  }

  modifyFirst(blueprint, column) {
    if (!isBlank(column.first)) {
      return ' first';
    }
    return '';
  }

  modifyAfter(blueprint, column) {
    if (!isBlank(column.after)) {
      return ' after ' + this.wrap(column.after);
    }
    return '';
  }

  modifyComment(blueprint, column) {
    if (!isBlank(column.comment)) {
      return ` comment '${column.comment.replace(/'/g, '\\\'')}'`;
    }
    return '';
  }

  modifySrid(blueprint, column) {
    if (!isBlank(column.srid) && isNumber(column.srid) && column.srid > 0) {
      return ' srid ' + column.srid;
    }
    return '';
  }

  wrapValue(value) {
    if (value !== '*') {
      return '`' + value.replace(/`/g, '``') + '`';
    }
    return value;
  }

  wrapJsonSelector(value) {
    const [field, path] = this.wrapJsonFieldAndPath(value);
    return 'json_unquote(json_extract(' + field + path + '))';
  }
}
