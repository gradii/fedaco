import { __awaiter } from 'tslib'
import { isBlank } from '@gradii/check-type'
import { Connection } from '../connection'
import { SqlserverQueryGrammar } from '../query-builder/grammar/sqlserver-query-grammar'
import { SqlServerProcessor } from '../query-builder/processor/sql-server-processor'
import { SqlServerSchemaBuilder } from '../schema/builder/sql-server-schema-builder'
import { SqlServerSchemaGrammar } from '../schema/grammar/sql-server-schema-grammar'
export class SqlServerConnection extends Connection {
  transaction(callback, attempts = 1) {
    const _super = Object.create(null, {
      transaction: { get: () => super.transaction },
    })
    return __awaiter(this, void 0, void 0, function* () {
      for (let a = 1; a <= attempts; a++) {
        if (this.getDriverName() === 'sqlsrv') {
          return yield _super.transaction.call(this, callback)
        }

        let result
        try {
          result = yield callback(this)
        } catch (e) {
          throw e
        }
        return result
      }
    })
  }

  getDefaultQueryGrammar() {
    return this.withTablePrefix(new SqlserverQueryGrammar())
  }

  getSchemaBuilder() {
    if (isBlank(this.schemaGrammar)) {
      this.useDefaultSchemaGrammar()
    }
    return new SqlServerSchemaBuilder(this)
  }

  getDefaultSchemaGrammar() {
    return this.withTablePrefix(new SqlServerSchemaGrammar())
  }

  getSchemaState(files, processFactory) {
    throw new Error(
      'RuntimeException Schema dumping is not supported when using SQL Server.'
    )
  }

  getDefaultPostProcessor() {
    return new SqlServerProcessor()
  }

  getDoctrineDriver() {}
}
