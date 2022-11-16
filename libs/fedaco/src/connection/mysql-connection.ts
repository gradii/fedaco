/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray, isBlank } from '@gradii/nanofn';
import { Connection } from '../connection';
import { MysqlQueryGrammar } from '../query-builder/grammar/mysql-query-grammar';
import { MysqlProcessor } from '../query-builder/processor/mysql-processor';
import { MysqlSchemaBuilder } from '../schema/builder/mysql-schema-builder';
import { MysqlSchemaGrammar } from '../schema/grammar/mysql-schema-grammar';
import type { SchemaGrammar } from '../schema/grammar/schema-grammar';
import { MySqlSchemaState } from '../schema/mysql-schema-state';

export class MysqlConnection extends Connection {
  _version: string;
  _isMaria: boolean;

  /*Determine if the connected database is a MariaDB database.*/
  public async isMaria() {
    if (isBlank(this._isMaria)) {
      try {
        const data = await this.selectOne('SELECT VERSION() as version');
        if (data) {
          this._version = data.version;
          this._isMaria = this._version.indexOf('MariaDB') !== -1;
        } else {
          this._isMaria = false;
        }
      } catch (e) {
        console.error('can not get mysql db version');
      }
    }
    return this._isMaria;
    // return (await this.getPdo()).getAttribute('ATTR_SERVER_VERSION').includes('MariaDB');
  }

  /*Get the default query grammar instance.*/
  protected getDefaultQueryGrammar(): MysqlQueryGrammar {
    return this.withTablePrefix(new MysqlQueryGrammar()) as MysqlQueryGrammar;
  }

  /*Get a schema builder instance for the connection.*/
  public getSchemaBuilder(): MysqlSchemaBuilder {
    if (isBlank(this.schemaGrammar)) {
      this.useDefaultSchemaGrammar();
    }
    return new MysqlSchemaBuilder(this);
  }

  /*Get the default schema grammar instance.*/
  protected getDefaultSchemaGrammar(): SchemaGrammar {
    return this.withTablePrefix(new MysqlSchemaGrammar()) as SchemaGrammar;
  }

  /*Get the schema state for the connection.*/
  public getSchemaState(files?: any, processFactory?: Function) {
    return new MySqlSchemaState(this, files, processFactory);
  }

  /*Get the default post processor instance.*/
  protected getDefaultPostProcessor() {
    return new MysqlProcessor();
  }

  /*Get the Doctrine DBAL driver.*/
  protected getDoctrineDriver() {
    // return new MysqlDriver();
  }

  public async insertGetId(query: string, bindings: any[] = [], sequence: string) {
    if (!(await this.isMaria())) {
      if (query.includes('returning')) {
        query = query.replace(/\s+returning\s+.+$/, '');
      }

      await this.statement(query, bindings);
      const d = await this.selectOne('SELECT LAST_INSERT_ID() as id');
      return d.id;
    }
    const data = await this.statement(query, bindings);
    return isArray(data) && data.length === 1 ? data[0][sequence] : null;
  }
}
