/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { MysqlQueryBuilderVisitor } from '../visitor/mysql-query-builder-visitor';
import { QueryGrammar } from './query-grammar';
export declare class MysqlQueryGrammar extends QueryGrammar implements GrammarInterface {
    private _tablePrefix;
    compileJoins(): void;
    protected _createVisitor(queryBuilder: QueryBuilder): MysqlQueryBuilderVisitor;
    compileSelect(builder: QueryBuilder): string;
    compileUpdate(builder: QueryBuilder, values: any): string;
    distinct(distinct: boolean | any[]): string;
    quoteColumnName(columnName: string): string;
    quoteTableName(tableName: string): string;
    quoteSchemaName(quoteSchemaName: string): string;
    setTablePrefix(prefix: string): this;
    compileInsert(builder: QueryBuilder, values: any, insertOption?: string): string;
    compileInsertGetId(builder: QueryBuilder, values: any, sequence: string): string;
}
