/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from '../connection';
import { SqlserverQueryGrammar } from '../query-builder/grammar/sqlserver-query-grammar';
import { SqlServerProcessor } from '../query-builder/processor/sql-server-processor';
import { SchemaGrammar } from '../schema/grammar/schema-grammar';
import { SchemaBuilder } from '../schema/schema-builder';
export declare class SqlServerConnection extends Connection {
    transaction(callback: (...args: any[]) => Promise<any>, attempts?: number): Promise<any>;
    protected getDefaultQueryGrammar(): SqlserverQueryGrammar;
    getSchemaBuilder(): SchemaBuilder;
    protected getDefaultSchemaGrammar(): SchemaGrammar;
    getSchemaState(files?: any, processFactory?: Function): void;
    protected getDefaultPostProcessor(): SqlServerProcessor;
    protected getDoctrineDriver(): void;
}
