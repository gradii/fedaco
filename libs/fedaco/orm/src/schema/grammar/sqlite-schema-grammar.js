import { __awaiter } from 'tslib';
import { isBlank } from '@gradii/check-type';
import { SchemaGrammar } from './schema-grammar';

export class SqliteSchemaGrammar extends SchemaGrammar {
  constructor() {
    super(...arguments);

    this.modifiers = ['VirtualAs', 'StoredAs', 'Nullable', 'Default', 'Increment'];

    this.serials = [
      'bigInteger', 'integer', 'mediumInteger', 'smallInteger', 'tinyInteger'
    ];
  }

  compileTableExists() {
    return 'select * from sqlite_master where type = \'table\' and name = ?';
  }

  compileColumnListing(table) {
    return 'pragma table_info(' + this.wrap(table.replace(/\./g, '__')) + ')';
  }

  compileCreate(blueprint, command) {
    return `${blueprint._temporary ? 'create temporary' : 'create'} table ${this.wrapTable(blueprint)} (${this.getColumns(blueprint).join(', ')}${this.addForeignKeys(blueprint)}${this.addPrimaryKeys(blueprint)})`;
  }

  addForeignKeys(blueprint) {
    const foreigns = this.getCommandsByName(blueprint, 'foreign');
    return foreigns.reduce((sql, foreign) => {
      sql += this.getForeignKey(foreign);
      if (!isBlank(foreign.onDelete)) {
        sql += '" on delete {$foreign->onDelete}"';
      }
      if (!isBlank(foreign.onUpdate)) {
        sql += '" on update {$foreign->onUpdate}"';
      }
      return sql;
    }, '');
  }

  getForeignKey(foreign) {
    return `, foreign key(${this.columnize(foreign.columns)}) references ${this.wrapTable(foreign.on)}(${this.columnize(foreign.references)})`;
  }

  addPrimaryKeys(blueprint) {
    const primary = this.getCommandByName(blueprint, 'primary');
    if (!isBlank(primary)) {
      return `, primary key (${this.columnize(primary.columns)})`;
    }
    return '';
  }

  compileAdd(blueprint, command) {
    const columns = this.prefixArray('add column', this.getColumns(blueprint));
    return columns.filter(column => {
      return !(/as \(.*\) stored/.exec(column));
    }).map(column => {
      return `alter table ${this.wrapTable(blueprint)} ${column}`;
    });
  }

  compileUnique(blueprint, command) {
    return 'create unique index ' + `${this.wrap(command.index)} on ${this.wrapTable(blueprint)} (${this.columnize(command.columns)})`;
  }

  compileIndex(blueprint, command) {
    return 'create index ' + `${this.wrap(command.index)} on ${this.wrapTable(blueprint)} (${this.columnize(command.columns)})`;
  }

  compileSpatialIndex(blueprint, command) {
    throw new Error('RuntimeException The database driver in use does not support spatial indexes.');
  }

  compileForeign(blueprint, command) {
    return '';
  }

  compileDrop(blueprint, command) {
    return `drop table ${this.wrapTable(blueprint)}`;
  }

  compileDropIfExists(blueprint, command) {
    return `drop table if exists ${this.wrapTable(blueprint)}`;
  }

  compileDropAllTables() {
    return 'delete from sqlite_master where type in ' + `('table', 'index', 'trigger')`;
  }

  compileDropAllViews() {
    return 'delete from sqlite_master where type in ' + `('view')`;
  }

  compileRebuild() {
    return 'vacuum';
  }

  compileDropColumn(blueprint, command, connection) {
    return __awaiter(this, void 0, void 0, function* () {
      const schema = connection.getSchemaBuilder();
      const tableDiff = yield this.getTableDiff(blueprint, schema);
      for (const name of command.columns) {
        tableDiff.removedColumns[name] = connection.getDoctrineColumn(this.getTablePrefix() + blueprint.getTable(), name);
      }
      return this.getAlterTableSQL(tableDiff);
    });
  }

  compileDropUnique(blueprint, command) {
    const index = this.wrap(command.index);
    return 'drop index ' + `${index}`;
  }

  compileDropIndex(blueprint, command) {
    const index = this.wrap(command.index);
    return 'drop index ' + `${index}`;
  }

  compilePrimary(blueprint, command) {
    return null;
  }

  compileDropSpatialIndex(blueprint, command) {
    throw new Error('RuntimeException The database driver in use does not support spatial indexes.');
  }

  compileRename(blueprint, command) {
    const from = this.wrapTable(blueprint);
    return `alter table ${from} rename to ${this.wrapTable(command.to)}`;
  }

  compileRenameIndex(blueprint, command, connection) {


  }

  compileEnableForeignKeyConstraints() {
    return 'PRAGMA foreign_keys = ON;';
  }

  compileDisableForeignKeyConstraints() {
    return 'PRAGMA foreign_keys = OFF;';
  }

  compileEnableWriteableSchema() {
    return 'PRAGMA writable_schema = 1;';
  }

  compileDisableWriteableSchema() {
    return 'PRAGMA writable_schema = 0;';
  }

  typeChar(column) {
    return 'varchar';
  }

  typeString(column) {
    return 'varchar';
  }

  typeTinyText(column) {
    return 'text';
  }

  typeText(column) {
    return 'text';
  }

  typeMediumText(column) {
    return 'text';
  }

  typeLongText(column) {
    return 'text';
  }

  typeInteger(column) {
    return 'integer';
  }

  typeBigInteger(column) {
    return 'integer';
  }

  typeMediumInteger(column) {
    return 'integer';
  }

  typeTinyInteger(column) {
    return 'integer';
  }

  typeSmallInteger(column) {
    return 'integer';
  }

  typeFloat(column) {
    return 'float';
  }

  typeDouble(column) {
    return 'float';
  }

  typeDecimal(column) {
    return 'numeric';
  }

  typeBoolean(column) {
    return 'tinyint(1)';
  }

  typeEnum(column) {
    return `varchar check ("${column.name}" in (${this.quoteString(column.allowed)}))`;
  }

  typeJson(column) {
    return 'text';
  }

  typeJsonb(column) {
    return 'text';
  }

  typeDate(column) {
    return 'date';
  }

  typeDateTime(column) {
    return this.typeTimestamp(column);
  }

  typeDateTimeTz(column) {
    return this.typeDateTime(column);
  }

  typeTime(column) {
    return 'time';
  }

  typeTimeTz(column) {
    return this.typeTime(column);
  }

  typeTimestamp(column) {
    return column.useCurrent ? 'datetime default CURRENT_TIMESTAMP' : 'datetime';
  }

  typeTimestampTz(column) {
    return this.typeTimestamp(column);
  }

  typeYear(column) {
    return this.typeInteger(column);
  }

  typeBinary(column) {
    return 'blob';
  }

  typeUuid(column) {
    return 'varchar';
  }

  typeIpAddress(column) {
    return 'varchar';
  }

  typeMacAddress(column) {
    return 'varchar';
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
    virtualAs = column.virtualAs;
    if (!isBlank(virtualAs)) {
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
    storedAs = column.storedAs;
    if (!isBlank(storedAs)) {
      return ` as (${column.storedAs}) stored`;
    }
    return '';
  }

  modifyNullable(blueprint, column) {
    if (isBlank(column.virtualAs) && isBlank(column.virtualAsJson) && isBlank(column.storedAs) && isBlank(column.storedAsJson)) {
      return column.nullable ? '' : ' not null';
    }
    if (column.nullable === false) {
      return ' not null';
    }
    return '';
  }

  modifyDefault(blueprint, column) {
    if (!isBlank(column.default) && isBlank(column.virtualAs) && isBlank(column.virtualAsJson) && isBlank(column.storedAs)) {
      return ' default ' + this.getDefaultValue(column.default);
    }
    return '';
  }

  modifyIncrement(blueprint, column) {
    if (this.serials.includes(column.type) && column.autoIncrement) {
      return ' primary key autoincrement';
    }
    return '';
  }

  wrapJsonSelector(value) {
    const [field, path] = this.wrapJsonFieldAndPath(value);
    return 'json_extract(' + field + path + ')';
  }

  getListTableColumnsSQL(table, database) {
    table = table.replace(/\./g, '__');
    return `PRAGMA table_info(${this.quoteStringLiteral(table)})`;
  }

  getListTableForeignKeysSQL(table, database) {
    table = table.replace(/\./g, '__');
    return `PRAGMA foreign_key_list(${this.quoteStringLiteral(table)})`;
  }

  getListTablesSQL() {
    return `SELECT name
            FROM sqlite_master
            WHERE type = 'table'
              AND name != 'sqlite_sequence'
              AND name != 'geometry_columns'
              AND name != 'spatial_ref_sys'
            UNION ALL
    SELECT name
    FROM sqlite_temp_master
    WHERE type = 'table'
    ORDER BY name`;
  }

  getAlterTableSQL(tableDiff) {
    return 'undo sql';
  }
}
