/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from '../connection';
import { QueryGrammar } from '../query-builder/grammar/query-grammar';
import { SqliteProcessor } from '../query-builder/processor/sqlite-processor';
import { SchemaGrammar } from '../schema/grammar/schema-grammar';
import { SchemaBuilder } from '../schema/schema-builder';
import { SqliteSchemaState } from '../schema/sqlite-schema-state';
export declare class SqliteConnection extends Connection {
    constructor(pdo: any, database?: string, tablePrefix?: string, config?: any);
    protected getDefaultQueryGrammar(): QueryGrammar;
    getSchemaBuilder(): SchemaBuilder;
    protected getDefaultSchemaGrammar(): SchemaGrammar;
    getSchemaState(files?: any, processFactory?: Function | null): SqliteSchemaState;
    protected getDefaultPostProcessor(): SqliteProcessor;
    protected getDoctrineDriver(): void;
    protected getForeignKeyConstraintsConfigurationValue(): any;
}
