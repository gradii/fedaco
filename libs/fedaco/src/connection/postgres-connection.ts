/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray, isBlank, isString } from '@gradii/nanofn';
import { Connection } from '../connection';
import { PostgresQueryGrammar } from '../query-builder/grammar/postgres-query-grammar';
import { PostgresProcessor } from '../query-builder/processor/postgres-processor';
import { PostgresSchemaBuilder } from '../schema/builder/postgres-schema-builder';
import { PostgresSchemaGrammar } from '../schema/grammar/postgres-schema-grammar';
import { PostgresSchemaState } from '../schema/postgres-schema-state';

export class PostgresConnection extends Connection {
  /*Bind values to their parameters in the given statement.*/
  // public bindValues(statement: any, bindings: any[]) {
  //   for (const [key, value] of Object.entries(bindings)) {
  //     // if (isNumber(value)) {
  //     //   const pdoParam = PDO.PARAM_INT;
  //     // } else if (is_resource(value)) {
  //     //   const pdoParam = PDO.PARAM_LOB;
  //     // } else {
  //     //   const pdoParam = PDO.PARAM_STR;
  //     // }
  //     statement.bindValue(isString(key) ? key : key + 1, value, -1);
  //   }
  // }

  protected escapeBinary(value: string) {
    const hex = Buffer.from(value).toString('hex');

    return `'\\x${hex}'::bytea`;
  }

  /*Get the default query grammar instance.*/
  protected getDefaultQueryGrammar(): PostgresQueryGrammar {
    return this.withTablePrefix(new PostgresQueryGrammar()) as PostgresQueryGrammar;
  }

  /*Get a schema builder instance for the connection.*/
  public getSchemaBuilder(): PostgresSchemaBuilder {
    if (isBlank(this.schemaGrammar)) {
      this.useDefaultSchemaGrammar();
    }
    return new PostgresSchemaBuilder(this);
  }

  /*Get the default schema grammar instance.*/
  protected getDefaultSchemaGrammar(): PostgresSchemaGrammar {
    return this.withTablePrefix(new PostgresSchemaGrammar());
  }

  /*Get the schema state for the connection.*/
  public getSchemaState(files?: any, processFactory?: Function) {
    return new PostgresSchemaState(this, files, processFactory);
  }

  /*Get the default post processor instance.*/
  protected getDefaultPostProcessor() {
    return new PostgresProcessor();
  }

  public async insertGetId(query: string, bindings: any[] = [], sequence: string) {
    const data = await this.statement(query, bindings);
    return isArray(data) && data.length === 1 ? data[0][sequence] : null;
  }
}
