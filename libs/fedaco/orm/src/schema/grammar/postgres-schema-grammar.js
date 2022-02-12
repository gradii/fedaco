import { isBlank, isString } from '@gradii/check-type'
import { SchemaGrammar } from './schema-grammar'
export class PostgresSchemaGrammar extends SchemaGrammar {
  constructor() {
    super(...arguments)

    this.transactions = true

    this.modifiers = [
      'Collate',
      'Increment',
      'Nullable',
      'Default',
      'VirtualAs',
      'StoredAs',
    ]

    this.serials = [
      'bigInteger',
      'integer',
      'mediumInteger',
      'smallInteger',
      'tinyInteger',
    ]

    this.fluentCommands = ['Comment']
    this.ColumnDefinitionCommands = ['Comment']
  }

  compileCreateDatabase(name, connection) {
    return `create database ${this.wrapValue(name)} encoding ${this.wrapValue(
      connection.getConfig('charset')
    )}`
  }

  compileDropDatabaseIfExists(name) {
    return `drop database if exists ${this.wrapValue(name)}`
  }

  compileTableExists() {
    return `select *
            from information_schema.tables
            where table_catalog = ?
              and table_schema = ?
              and table_name = ?
              and table_type = 'BASE TABLE'`
  }

  compileColumnListing() {
    return `select column_name
            from information_schema.columns
            where table_catalog = ?
              and table_schema = ?
              and table_name = ?`
  }

  compileCreate(blueprint, command) {
    return [
      ...[
        `${
          blueprint._temporary ? 'create temporary' : 'create'
        } table ${this.wrapTable(blueprint)} (${this.getColumns(blueprint).join(
          ', '
        )})`,
      ],
      ...this.compileAutoIncrementStartingValues(blueprint),
    ].filter((it) => !!it)
  }

  compileAdd(blueprint, command) {
    return [
      ...[
        `alter table ${this.wrapTable(blueprint)} ${this.prefixArray(
          'add column',
          this.getColumns(blueprint)
        ).join(', ')}`,
      ],
      ...this.compileAutoIncrementStartingValues(blueprint),
    ].filter((it) => !!it)
  }

  compileAutoIncrementStartingValues(blueprint) {
    return blueprint.autoIncrementingStartingValues().map((value, column) => {
      return (
        'alter sequence ' +
        blueprint.getTable() +
        '_' +
        column +
        '_seq restart with ' +
        value
      )
    })
  }

  compilePrimary(blueprint, command) {
    const columns = this.columnize(command.columns)
    return (
      'alter table ' +
      `${this.wrapTable(blueprint)} add primary key (${columns})`
    )
  }

  compileUnique(blueprint, command) {
    return (
      'alter table ' +
      `${this.wrapTable(blueprint)} add constraint ${this.wrap(
        command.index
      )} unique (${this.columnize(command.columns)})`
    )
  }

  compileIndex(blueprint, command) {
    return (
      'create index ' +
      `${this.wrap(command.index)} on ${this.wrapTable(blueprint)}${
        command.algorithm ? ' using ' + command.algorithm : ''
      } (${this.columnize(command.columns)})`
    )
  }

  compileSpatialIndex(blueprint, command) {
    command.withAlgorithm('gist')
    return this.compileIndex(blueprint, command)
  }

  compileForeign(blueprint, command) {
    let sql = super.compileForeign(blueprint, command)
    if (!isBlank(command.deferrable)) {
      sql += command.deferrable ? ' deferrable' : ' not deferrable'
    }
    if (command.deferrable && !isBlank(command.initiallyImmediate)) {
      sql += command.initiallyImmediate
        ? ' initially immediate'
        : ' initially deferred'
    }
    if (!isBlank(command.notValid)) {
      sql += ' not valid'
    }
    return sql
  }

  compileDrop(blueprint, command) {
    return `drop table ${this.wrapTable(blueprint)}`
  }

  compileDropIfExists(blueprint, command) {
    return `drop table if exists ${this.wrapTable(blueprint)}`
  }

  compileDropAllTables(tables) {
    return `drop table "${tables.join('","')}" cascade`
  }

  compileDropAllViews(views) {
    return `drop view "${views.join('","')}" cascade`
  }

  compileDropAllTypes(types) {
    return `drop type "${types.join('","')}" cascade`
  }

  compileGetAllTables(searchPath) {
    return `select tablename
            from pg_catalog.pg_tables
            where schemaname in ('${searchPath.join("','")}')`
  }

  compileGetAllViews(searchPath) {
    return `select viewname
            from pg_catalog.pg_views
            where schemaname in ('${searchPath.join("','")}')`
  }

  compileGetAllTypes() {
    return `select distinct pg_type.typname
            from pg_type
                   inner join pg_enum on pg_enum.enumtypid = pg_type.oid`
  }

  compileDropColumn(blueprint, command) {
    const columns = this.prefixArray(
      'drop column',
      this.wrapArray(command.columns)
    )
    return `alter table ${this.wrapTable(blueprint)} ${columns.join(', ')}`
  }

  compileDropPrimary(blueprint, command) {
    const index = this.wrap(`${blueprint.getTable()}_pkey`)
    return `alter table ${this.wrapTable(blueprint)} drop constraint ${index}`
  }

  compileDropUnique(blueprint, command) {
    const index = this.wrap(command.index)
    return `alter table ${this.wrapTable(blueprint)} drop constraint ${index}`
  }

  compileDropIndex(blueprint, command) {
    return 'drop index ' + `${this.wrap(command.index)}`
  }

  compileDropSpatialIndex(blueprint, command) {
    return this.compileDropIndex(blueprint, command)
  }

  compileDropForeign(blueprint, command) {
    const index = this.wrap(command.index)
    return (
      'alter table ' + `${this.wrapTable(blueprint)} drop constraint ${index}`
    )
  }

  compileRename(blueprint, command) {
    const from = this.wrapTable(blueprint)
    return 'alter table ' + `${from} rename to ${this.wrapTable(command.to)}`
  }

  compileRenameIndex(blueprint, command) {
    return (
      'alter index ' +
      `${this.wrap(command.from)} rename to ${this.wrap(command.to)}`
    )
  }

  compileEnableForeignKeyConstraints() {
    return 'SET CONSTRAINTS ALL IMMEDIATE;'
  }

  compileDisableForeignKeyConstraints() {
    return 'SET CONSTRAINTS ALL DEFERRED;'
  }

  compileComment(blueprint, command) {
    return `comment on column ${this.wrapTable(blueprint)}.${this.wrap(
      command.get('column').name
    )} is ${`'${command.get('column').comment.replace(/'/g, `''`)}'`}`
  }

  typeChar(column) {
    return `char(${column.length})`
  }

  typeString(column) {
    return `varchar(${column.length})`
  }

  typeTinyText(column) {
    return 'varchar(255)'
  }

  typeText(column) {
    return 'text'
  }

  typeMediumText(column) {
    return 'text'
  }

  typeLongText(column) {
    return 'text'
  }

  typeInteger(column) {
    return this.generatableColumn('integer', column)
  }

  typeBigInteger(column) {
    return this.generatableColumn('bigint', column)
  }

  typeMediumInteger(column) {
    return this.generatableColumn('integer', column)
  }

  typeTinyInteger(column) {
    return this.generatableColumn('smallint', column)
  }

  typeSmallInteger(column) {
    return this.generatableColumn('smallint', column)
  }

  generatableColumn(type, column) {
    if (!column.autoIncrement && isBlank(column.generatedAs)) {
      return type
    }
    if (column.autoIncrement && isBlank(column.generatedAs)) {
      return {
        integer: 'serial',
        bigint: 'bigserial',
        smallint: 'smallserial',
      }[type]
    }
    let options = ''
    if (isString(column.generatedAs) && column.generatedAs.length) {
      options = ` (${column.generatedAs})`
    }
    return `${type} generated ${
      column.always ? 'always' : 'by default'
    } as identity${options}`
  }

  typeFloat(column) {
    return this.typeDouble(column)
  }

  typeDouble(column) {
    return 'double precision'
  }

  typeReal(column) {
    return 'real'
  }

  typeDecimal(column) {
    return `decimal(${column.total}, ${column.places})`
  }

  typeBoolean(column) {
    return 'boolean'
  }

  typeEnum(column) {
    return `varchar(255) check ("${column.name}" in (${this.quoteString(
      column.allowed
    )}))`
  }

  typeJson(column) {
    return 'json'
  }

  typeJsonb(column) {
    return 'jsonb'
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
    return `time${
      isBlank(column.precision) ? '' : `(${column.precision})`
    } without time zone`
  }

  typeTimeTz(column) {
    return `time${
      isBlank(column.precision) ? '' : `(${column.precision})`
    } with time zone`
  }

  typeTimestamp(column) {
    const columnType = `timestamp${
      isBlank(column.precision) ? '' : `(${column.precision})`
    } without time zone`
    return column.useCurrent
      ? '"$columnType default CURRENT_TIMESTAMP" '
      : columnType
  }

  typeTimestampTz(column) {
    const columnType = `timestamp${
      isBlank(column.precision) ? '' : `(${column.precision})`
    } with time zone`
    return column.useCurrent
      ? `${columnType} default CURRENT_TIMESTAMP`
      : columnType
  }

  typeYear(column) {
    return this.typeInteger(column)
  }

  typeBinary(column) {
    return 'bytea'
  }

  typeUuid(column) {
    return 'uuid'
  }

  typeIpAddress(column) {
    return 'inet'
  }

  typeMacAddress(column) {
    return 'macaddr'
  }

  typeGeometry(column) {
    return this.formatPostGisType('geometry', column)
  }

  typePoint(column) {
    return this.formatPostGisType('point', column)
  }

  typeLineString(column) {
    return this.formatPostGisType('linestring', column)
  }

  typePolygon(column) {
    return this.formatPostGisType('polygon', column)
  }

  typeGeometryCollection(column) {
    return this.formatPostGisType('geometrycollection', column)
  }

  typeMultiPoint(column) {
    return this.formatPostGisType('multipoint', column)
  }

  typeMultiLineString(column) {
    return this.formatPostGisType('multilinestring', column)
  }

  typeMultiPolygon(column) {
    return this.formatPostGisType('multipolygon', column)
  }

  typeMultiPolygonZ(column) {
    return this.formatPostGisType('multipolygonz', column)
  }

  formatPostGisType(type, column) {
    var _a
    if (column.isGeometry === null) {
      return `geography(${type}, ${
        (_a = column.projection) !== null && _a !== void 0 ? _a : '4326'
      })`
    }
    if (column.projection !== null) {
      return `geometry(${type}, ${column.projection})`
    }
    return `geometry(${type})`
  }

  modifyCollate(blueprint, column) {
    if (!isBlank(column.collation)) {
      return ' collate ' + this.wrapValue(column.collation)
    }
    return ''
  }

  modifyNullable(blueprint, column) {
    return column.nullable ? ' null' : ' not null'
  }

  modifyDefault(blueprint, column) {
    if (!isBlank(column.default)) {
      return ` default ${this.getDefaultValue(column.default)}`
    }
    return ''
  }

  modifyIncrement(blueprint, column) {
    if (
      (this.serials.includes(column.type) || column.generatedAs !== null) &&
      column.autoIncrement
    ) {
      return ' primary key'
    }
    return ''
  }

  modifyVirtualAs(blueprint, column) {
    if (column.virtualAs !== null) {
      return ` generated always as (${column.virtualAs})`
    }
    return ''
  }

  modifyStoredAs(blueprint, column) {
    if (column.storedAs !== null) {
      return ` generated always as (${column.storedAs}) stored`
    }
    return ''
  }
}
