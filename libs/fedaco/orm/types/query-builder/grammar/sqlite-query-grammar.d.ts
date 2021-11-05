/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { DeleteSpecification } from '../../query/ast/delete-specification';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { SqliteQueryBuilderVisitor } from '../visitor/sqlite-query-builder-visitor';
import { QueryGrammar } from './query-grammar';
export declare class SqliteQueryGrammar extends QueryGrammar implements GrammarInterface {
    private _tablePrefix;
    compileJoins(): void;
    protected _createVisitor(queryBuilder: any): SqliteQueryBuilderVisitor;
    compileInsertOrIgnore(builder: QueryBuilder, values: any): string;
    compileTruncate(query: QueryBuilder): {
        [sql: string]: any[];
    };
    compileSelect(builder: QueryBuilder): string;
    distinct(distinct: boolean | any[]): string;
    quoteColumnName(columnName: string): string;
    quoteTableName(tableName: any): string;
    unQuoteTableName(tableName: any): string;
    setTablePrefix(prefix: string): this;
    protected _prepareDeleteAstWithJoins(builder: QueryBuilder): DeleteSpecification;
    protected _prepareDeleteAstWithoutJoins(builder: QueryBuilder): DeleteSpecification;
}
