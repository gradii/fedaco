var _SqliteSchemaBuilder_instances, _SqliteSchemaBuilder_getCreateTableSQL
import { __awaiter } from 'tslib'
import * as fs from 'fs'
import { Column } from '../../dbal/column'
import { SchemaBuilder } from '../schema-builder'
export class SqliteSchemaBuilder extends SchemaBuilder {
  constructor() {
    super(...arguments)
    _SqliteSchemaBuilder_instances.add(this)
  }

  createDatabase(name) {
    fs.writeFileSync(name, '')
  }

  dropDatabaseIfExists(name) {
    return fs.existsSync(name) ? fs.rmSync(name) : true
  }

  dropAllTables() {
    if (this.connection.getDatabaseName() !== ':memory:') {
      return this.refreshDatabaseFile()
    }
    this.connection.select(this.grammar.compileEnableWriteableSchema())
    this.connection.select(this.grammar.compileDropAllTables())
    this.connection.select(this.grammar.compileDisableWriteableSchema())
    this.connection.select(this.grammar.compileRebuild())
  }

  dropAllViews() {
    this.connection.select(this.grammar.compileEnableWriteableSchema())
    this.connection.select(this.grammar.compileDropAllViews())
    this.connection.select(this.grammar.compileDisableWriteableSchema())
    this.connection.select(this.grammar.compileRebuild())
  }

  refreshDatabaseFile() {
    fs.writeFileSync(this.connection.getDatabaseName(), '')
  }
  _getPortableTableColumnDefinition(tableColumn) {
    var _a
    const parts = tableColumn['type'].split('(')
    tableColumn['type'] = parts[0].trim()
    if (parts[1] !== undefined) {
      tableColumn['length'] = +parts[1].replace(/\)$/, '')
    }
    let dbType = tableColumn['type'].toLowerCase()
    let length =
      (_a = tableColumn['length']) !== null && _a !== void 0 ? _a : null
    let unsigned = false
    if (dbType.includes(' unsigned')) {
      dbType = dbType.replace(' unsigned', '')
      unsigned = true
    }
    let fixed = false
    const type = this.grammar.getTypeMapping(dbType)
    let _default = tableColumn['dflt_value']
    if (_default === 'NULL') {
      _default = null
    }
    if (_default !== null) {
      const matches = /^'(.*)'$/gs.exec(_default)
      if (matches) {
        _default = matches[1].replace(`''`, `'`)
      }
    }
    const notnull = tableColumn['notnull']
    if (!(tableColumn['name'] !== undefined)) {
      tableColumn['name'] = ''
    }
    let precision = null
    let scale = null
    switch (dbType) {
      case 'char':
        fixed = true
        break
      case 'float':
      case 'double':
      case 'real':
      case 'decimal':
      case 'numeric':
        if (tableColumn['length'] !== undefined) {
          if (!tableColumn['length'].includes(',')) {
            tableColumn['length'] += ',0'
          }
          ;[precision, scale] = tableColumn['length']
            .split(',')
            .map((it) => it.trim())
        }
        length = null
        break
    }
    const options = {
      length: length,
      unsigned: Boolean(unsigned),
      fixed: fixed,
      notnull: notnull,
      default: _default,
      precision: precision,
      scale: scale,
      autoincrement: false,
    }
    return new Column(tableColumn['name'], type, options)
  }
  listTableDetails(tableName) {
    const table = super.listTableDetails(tableName)

    return table
  }
}
;(_SqliteSchemaBuilder_instances = new WeakSet()),
  (_SqliteSchemaBuilder_getCreateTableSQL =
    function _SqliteSchemaBuilder_getCreateTableSQL(table) {
      return __awaiter(this, void 0, void 0, function* () {
        return (
          (yield this.connection.select(
            `SELECT sql
               FROM (SELECT * FROM sqlite_master UNION ALL SELECT * FROM sqlite_temp_master)
               WHERE type = 'table' AND name = ?`,
            [table]
          )) || null
        )
      })
    })
