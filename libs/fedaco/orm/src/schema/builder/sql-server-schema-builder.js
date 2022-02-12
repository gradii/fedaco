import { SchemaBuilder } from '../schema-builder'
export class SqlServerSchemaBuilder extends SchemaBuilder {
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

  dropAllTables() {
    this.connection.statement(this.grammar.compileDropAllForeignKeys())
    this.connection.statement(this.grammar.compileDropAllTables())
  }

  dropAllViews() {
    this.connection.statement(this.grammar.compileDropAllViews())
  }
}
