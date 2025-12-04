/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/nanofn';
import { Connection } from '../connection';
import { SqlserverQueryGrammar } from '../query-builder/grammar/sqlserver-query-grammar';
import { SqlServerProcessor } from '../query-builder/processor/sql-server-processor';
import { SqlServerSchemaBuilder } from '../schema/builder/sql-server-schema-builder';
import type { SchemaGrammar } from '../schema/grammar/schema-grammar';
import { SqlServerSchemaGrammar } from '../schema/grammar/sql-server-schema-grammar';
import type { SchemaBuilder } from '../schema/schema-builder';

export class SqlServerConnection extends Connection {
  /* Execute a Closure within a transaction. */
  public async transaction(callback: (...args: any[]) => Promise<any>, attempts = 1) {
    for (let a = 1; a <= attempts; a++) {
      if (this.getDriverName() === 'sqlsrv') {
        return await super.transaction(callback);
      }
      // await (this.getPdo()).exec('BEGIN TRAN');
      let result;
      try {
        result = await callback(this);
        // this.getPdo().exec('COMMIT TRAN');
      } catch (e) {
        // this.getPdo().exec('ROLLBACK TRAN');
        throw e;
      }
      return result;
    }
  }

  protected escapeBinary(value: string) {
    const hex = Buffer.from(value).toString('hex');

    return `0x${hex}`;
  }

  /* Get the default query grammar instance. */
  protected getDefaultQueryGrammar() {
    return this.withTablePrefix(new SqlserverQueryGrammar());
  }

  /* Get a schema builder instance for the connection. */
  public getSchemaBuilder(): SchemaBuilder {
    if (isBlank(this.schemaGrammar)) {
      this.useDefaultSchemaGrammar();
    }
    return new SqlServerSchemaBuilder(this);
  }

  /* Get the default schema grammar instance. */
  protected getDefaultSchemaGrammar(): SchemaGrammar {
    return this.withTablePrefix(new SqlServerSchemaGrammar()) as SchemaGrammar;
  }

  /* Get the schema state for the connection. */
  public getSchemaState(files?: any, processFactory?: Function) {
    throw new Error('RuntimeException Schema dumping is not supported when using SQL Server.');
  }

  /* Get the default post processor instance. */
  protected getDefaultPostProcessor() {
    return new SqlServerProcessor();
  }
}
