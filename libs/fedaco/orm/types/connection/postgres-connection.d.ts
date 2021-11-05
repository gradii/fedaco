/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from '../connection';
import { PostgresQueryGrammar } from '../query-builder/grammar/postgres-query-grammar';
import { PostgresProcessor } from '../query-builder/processor/postgres-processor';
import { PostgresSchemaGrammar } from '../schema/grammar/postgres-schema-grammar';
import { PostgresSchemaState } from '../schema/postgres-schema-state';
export declare class PostgresConnection extends Connection {
    protected getDefaultQueryGrammar(): PostgresQueryGrammar;
    getSchemaBuilder(): any;
    protected getDefaultSchemaGrammar(): PostgresSchemaGrammar;
    getSchemaState(files?: any, processFactory?: Function): PostgresSchemaState;
    protected getDefaultPostProcessor(): PostgresProcessor;
    protected getDoctrineDriver(): void;
}
