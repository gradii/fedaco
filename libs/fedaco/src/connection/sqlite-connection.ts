/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/nanofn';
import { Connection } from '../connection';
import type { QueryGrammar } from '../query-builder/grammar/query-grammar';
import { SqliteQueryGrammar } from '../query-builder/grammar/sqlite-query-grammar';
import { SqliteProcessor } from '../query-builder/processor/sqlite-processor';
import { SqliteSchemaBuilder } from '../schema/builder/sqlite-schema-builder';
import type { SchemaGrammar } from '../schema/grammar/schema-grammar';
import { SqliteSchemaGrammar } from '../schema/grammar/sqlite-schema-grammar';
import type { SchemaBuilder } from '../schema/schema-builder';
import { SqliteSchemaState } from '../schema/sqlite-schema-state';

export class SqliteConnection extends Connection {
  /*Create a new database connection instance.*/
  public constructor(pdo: any,
                     database: string    = '',
                     tablePrefix: string = '',
                     config: any         = {}) {
    super(pdo, database, tablePrefix, config);
    const enableForeignKeyConstraints = this.getForeignKeyConstraintsConfigurationValue();
    setTimeout(() => {
        if (!isBlank(enableForeignKeyConstraints)) {
          enableForeignKeyConstraints ?
            this.getSchemaBuilder().enableForeignKeyConstraints() :
            this.getSchemaBuilder().disableForeignKeyConstraints();
        }
      }, 1000
    );
  }

  protected escapeBinary(value: string) {
    const hex = Buffer.from(value).toString('hex');

    return `x'${hex}'`;
  }

  /*Get the default query grammar instance.*/
  protected getDefaultQueryGrammar(): QueryGrammar {
    return this.withTablePrefix(new SqliteQueryGrammar()) as QueryGrammar;
  }

  /*Get a schema builder instance for the connection.*/
  public getSchemaBuilder(): SchemaBuilder {
    if (isBlank(this.schemaGrammar)) {
      this.useDefaultSchemaGrammar();
    }
    return new SqliteSchemaBuilder(this);
  }

  /*Get the default schema grammar instance.*/
  protected getDefaultSchemaGrammar(): SchemaGrammar {
    return this.withTablePrefix(new SqliteSchemaGrammar()) as SchemaGrammar;
  }

  /*Get the schema state for the connection.*/
  public getSchemaState(files: any = null, processFactory: Function | null = null) {
    return new SqliteSchemaState(this, files, processFactory);
  }

  /*Get the default post processor instance.*/
  protected getDefaultPostProcessor() {
    return new SqliteProcessor();
  }

  /*Get the database connection foreign key constraints configuration option.*/
  protected getForeignKeyConstraintsConfigurationValue() {
    return this.getConfig('foreign_key_constraints');
  }
}
