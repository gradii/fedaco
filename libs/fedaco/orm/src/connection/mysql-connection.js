/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { __awaiter } from 'tslib'
import { isArray, isBlank } from '@gradii/check-type'
import { Connection } from '../connection'
import { MysqlQueryGrammar } from '../query-builder/grammar/mysql-query-grammar'
import { MysqlProcessor } from '../query-builder/processor/mysql-processor'
import { MysqlSchemaBuilder } from '../schema/builder/mysql-schema-builder'
import { MysqlSchemaGrammar } from '../schema/grammar/mysql-schema-grammar'
import { MySqlSchemaState } from '../schema/mysql-schema-state'
export class MysqlConnection extends Connection {
  isMaria() {
    return __awaiter(this, void 0, void 0, function* () {
      if (isBlank(this._isMaria)) {
        try {
          const data = yield this.selectOne('SELECT VERSION() as version')
          if (data) {
            this._version = data.version
            this._isMaria = this._version.indexOf('MariaDB') !== -1
          } else {
            this._isMaria = false
          }
        } catch (e) {
          console.error('can not get mysql db version')
        }
      }
      return this._isMaria
    })
  }

  getDefaultQueryGrammar() {
    return this.withTablePrefix(new MysqlQueryGrammar())
  }

  getSchemaBuilder() {
    if (isBlank(this.schemaGrammar)) {
      this.useDefaultSchemaGrammar()
    }
    return new MysqlSchemaBuilder(this)
  }

  getDefaultSchemaGrammar() {
    return this.withTablePrefix(new MysqlSchemaGrammar())
  }

  getSchemaState(files, processFactory) {
    return new MySqlSchemaState(this, files, processFactory)
  }

  getDefaultPostProcessor() {
    return new MysqlProcessor()
  }

  getDoctrineDriver() {}
  insertGetId(query, bindings = [], sequence) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!(yield this.isMaria())) {
        if (query.includes('returning')) {
          query = query.replace(/\s+returning\s+.+$/, '')
        }
        yield this.statement(query, bindings)
        const d = yield this.selectOne('SELECT LAST_INSERT_ID() as id')
        return d.id
      }
      const data = yield this.statement(query, bindings)
      return isArray(data) && data.length === 1 ? data[0][sequence] : null
    })
  }
}
