/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from '../connection';
import { MysqlQueryGrammar } from '../query-builder/grammar/mysql-query-grammar';
import { MysqlProcessor } from '../query-builder/processor/mysql-processor';
import { MysqlSchemaBuilder } from '../schema/builder/mysql-schema-builder';
import { SchemaGrammar } from '../schema/grammar/schema-grammar';
import { MySqlSchemaState } from '../schema/mysql-schema-state';
export declare class MysqlConnection extends Connection {
    isMaria(): Promise<boolean>;
    protected getDefaultQueryGrammar(): MysqlQueryGrammar;
    getSchemaBuilder(): MysqlSchemaBuilder;
    protected getDefaultSchemaGrammar(): SchemaGrammar;
    getSchemaState(files?: any, processFactory?: Function): MySqlSchemaState;
    protected getDefaultPostProcessor(): MysqlProcessor;
    protected getDoctrineDriver(): void;
    insertGetId(query: string, bindings: any[], sequence: string): Promise<any>;
}
