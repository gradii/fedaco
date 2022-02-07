/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ManagesTransactions } from '../manages-transactions';
import { SchemaBuilder } from '../schema/schema-builder';
import { QueryBuilder } from './query-builder';
/**
 *
 */
export interface ConnectionInterface extends ManagesTransactions {
    select(sql: string, bindings: any[], readConnection?: boolean): Promise<any> | any;
    insert(sql: string, bindings: any[]): Promise<boolean>;
    insertGetId(sql: string, bindings: any[], sequence?: string): Promise<any> | boolean;
    affectingStatement(query: string, bindings: any[]): Promise<any> | any;
    update(sql: string, bindings: any[]): Promise<any> | any;
    delete(sql: string, bindings: any[]): Promise<any> | any;
    statement(sql: string, bindings: any[]): Promise<any> | any;
    getName(): string;
    getSchemaBuilder(): SchemaBuilder;
    table(table: Function | QueryBuilder | string, as?: string): QueryBuilder;
    getPdo(): any;
    recordsHaveBeenModified(): any;
    selectFromWriteConnection(sql: string, values: any): any;
    getConfig(name: string): any;
    setTablePrefix(prefix: string): any;
}
