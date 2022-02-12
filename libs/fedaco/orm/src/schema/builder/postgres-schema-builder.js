import { __awaiter } from 'tslib'

import { SchemaBuilder } from '../schema-builder'
export class PostgresSchemaBuilder extends SchemaBuilder {
  createDatabase(name) {
    return this.connection.statement(
      this.grammar.compileCreateDatabase(name, this.connection)
    )
  }

  dropDatabaseIfExists(name) {
    return this.connection.statement(
      this.grammar.compileDropDatabaseIfExists(name)
    )
  }

  hasTable(table) {
    return __awaiter(this, void 0, void 0, function* () {
      let database, schema
      ;[database, schema, table] = this.parseSchemaAndTable(table)
      table = this.connection.getTablePrefix() + table
      const result = yield this.connection.select(
        this.grammar.compileTableExists(),
        [database, schema, table]
      )
      return result.length > 0
    })
  }

  dropAllTables() {
    var _a
    return __awaiter(this, void 0, void 0, function* () {
      const tables = []
      const excludedTables =
        (_a = this.connection.getConfig('dont_drop')) !== null && _a !== void 0
          ? _a
          : ['spatial_ref_sys']
      const result = yield this.getAllTables()
      for (const row of result) {
        const table = row
        if (!excludedTables.includes(table)) {
          tables.push(table)
        }
      }
      if (!tables.length) {
        return
      }
      yield this.connection.statement(this.grammar.compileDropAllTables(tables))
    })
  }

  dropAllViews() {
    return __awaiter(this, void 0, void 0, function* () {
      const views = []
      const result = yield this.getAllViews()
      for (const row of result) {
        views.push(row)
      }
      if (!views.length) {
        return
      }
      yield this.connection.statement(this.grammar.compileDropAllViews(views))
    })
  }

  dropAllTypes() {
    return __awaiter(this, void 0, void 0, function* () {
      const types = []
      const result = yield this.getAllTypes()
      for (const row of result) {
        types.push(row)
      }
      if (!types.length) {
        return
      }
      yield this.connection.statement(this.grammar.compileDropAllTypes(types))
    })
  }

  getAllTables() {
    return this.connection.select(
      this.grammar.compileGetAllTables(
        this.parseSearchPath(this.connection.getConfig('search_path'))
      )
    )
  }

  getAllViews() {
    return this.connection.select(
      this.grammar.compileGetAllViews(
        this.parseSearchPath(this.connection.getConfig('search_path'))
      )
    )
  }

  getAllTypes() {
    return this.connection.select(this.grammar.compileGetAllTypes())
  }

  getColumnListing(table) {
    return __awaiter(this, void 0, void 0, function* () {
      let database, schema
      ;[database, schema, table] = this.parseSchemaAndTable(table)
      table = this.connection.getTablePrefix() + table
      const results = yield this.connection.select(
        this.grammar.compileColumnListing(),
        [database, schema, table]
      )
      return this.connection.getPostProcessor().processColumnListing(results)
    })
  }

  parseSchemaAndTable(reference) {
    const searchPath = this.parseSearchPath(
      this.connection.getConfig('search_path') || 'public'
    )
    const parts = reference.split('.')
    let database = this.connection.getConfig('database')
    if (parts.length === 3) {
      database = parts[0]
      parts.shift()
    }
    let schema =
      searchPath[0] === '$user'
        ? this.connection.getConfig('username')
        : searchPath[0]
    if (parts.length === 2) {
      schema = parts[0]
      parts.shift()
    }
    return [database, schema, parts[0]]
  }

  parseSearchPath(searchPath) {
    return searchPath
  }
}
