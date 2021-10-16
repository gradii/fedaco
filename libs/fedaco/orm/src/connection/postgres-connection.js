import { isBlank } from '@gradii/check-type'
import { Connection } from '../connection'
import { PostgresQueryGrammar } from '../query-builder/grammar/postgres-query-grammar'
import { PostgresProcessor } from '../query-builder/processor/postgres-processor'
import { PostgresSchemaBuilder } from '../schema/builder/postgres-schema-builder'
import { PostgresSchemaGrammar } from '../schema/grammar/postgres-schema-grammar'
import { PostgresSchemaState } from '../schema/postgres-schema-state'
export class PostgresConnection extends Connection {
  getDefaultQueryGrammar() {
    return this.withTablePrefix(new PostgresQueryGrammar())
  }

  getSchemaBuilder() {
    if (isBlank(this.schemaGrammar)) {
      this.useDefaultSchemaGrammar()
    }
    return new PostgresSchemaBuilder(this)
  }

  getDefaultSchemaGrammar() {
    return this.withTablePrefix(new PostgresSchemaGrammar())
  }

  getSchemaState(files, processFactory) {
    return new PostgresSchemaState(this, files, processFactory)
  }

  getDefaultPostProcessor() {
    return new PostgresProcessor()
  }

  getDoctrineDriver() {}
}
