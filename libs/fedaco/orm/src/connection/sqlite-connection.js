/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { isBlank } from '@gradii/check-type'
import { Connection } from '../connection'
import { SqliteQueryGrammar } from '../query-builder/grammar/sqlite-query-grammar'
import { SqliteProcessor } from '../query-builder/processor/sqlite-processor'
import { SqliteSchemaBuilder } from '../schema/builder/sqlite-schema-builder'
import { SqliteSchemaGrammar } from '../schema/grammar/sqlite-schema-grammar'
import { SqliteSchemaState } from '../schema/sqlite-schema-state'
export class SqliteConnection extends Connection {
  constructor(pdo, database = '', tablePrefix = '', config = {}) {
    super(pdo, database, tablePrefix, config)
    const enableForeignKeyConstraints =
      this.getForeignKeyConstraintsConfigurationValue()
    if (!isBlank(enableForeignKeyConstraints)) {
      enableForeignKeyConstraints
        ? this.getSchemaBuilder().enableForeignKeyConstraints()
        : this.getSchemaBuilder().disableForeignKeyConstraints()
    }
  }

  getDefaultQueryGrammar() {
    return this.withTablePrefix(new SqliteQueryGrammar())
  }

  getSchemaBuilder() {
    if (isBlank(this.schemaGrammar)) {
      this.useDefaultSchemaGrammar()
    }
    return new SqliteSchemaBuilder(this)
  }

  getDefaultSchemaGrammar() {
    return this.withTablePrefix(new SqliteSchemaGrammar())
  }

  getSchemaState(files = null, processFactory = null) {
    return new SqliteSchemaState(this, files, processFactory)
  }

  getDefaultPostProcessor() {
    return new SqliteProcessor()
  }

  getDoctrineDriver() {}

  getForeignKeyConstraintsConfigurationValue() {
    return this.getConfig('foreign_key_constraints')
  }
}
