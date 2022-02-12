/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { __awaiter } from 'tslib'

import { SchemaBuilder } from '../schema-builder'
export class MysqlSchemaBuilder extends SchemaBuilder {
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
      table = this.connection.getTablePrefix() + table
      const result = yield this.connection.select(
        this.grammar.compileTableExists(),
        [this.connection.getDatabaseName(), table]
      )
      return result.length > 0
    })
  }

  getColumnListing(table) {
    return __awaiter(this, void 0, void 0, function* () {
      table = this.connection.getTablePrefix() + table
      const results = yield this.connection.select(
        this.grammar.compileColumnListing(),
        [this.connection.getDatabaseName(), table]
      )
      return this.connection.getPostProcessor().processColumnListing(results)
    })
  }

  dropAllTables() {
    return __awaiter(this, void 0, void 0, function* () {
      const tables = []
      const result = yield this.getAllTables()
      for (const row of result) {
        tables.push(Object.values(row)[0])
      }
      if (!tables.length) {
        return
      }
      yield this.disableForeignKeyConstraints()
      yield this.connection.statement(this.grammar.compileDropAllTables(tables))
      yield this.enableForeignKeyConstraints()
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

  getAllTables() {
    return this.connection.select(this.grammar.compileGetAllTables())
  }

  getAllViews() {
    return this.connection.select(this.grammar.compileGetAllViews())
  }
}
