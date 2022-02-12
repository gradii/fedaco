/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { DeleteSpecification } from '../../query/ast/delete-specification';
import { UpdateSpecification } from '../../query/ast/update-specification';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { QueryBuilderVisitor } from '../visitor/query-builder-visitor';
import { QueryGrammar } from './query-grammar';
export declare class PostgresQueryGrammar
    extends QueryGrammar
    implements GrammarInterface
{
    private _tablePrefix;
    compileJoins(): void;
    protected _createVisitor(queryBuilder: QueryBuilder): QueryBuilderVisitor;
    compilePredicateFuncName(funcName: string): string;
    compileTruncate(query: QueryBuilder): {
        [sql: string]: any[];
    };
    compileSelect(builder: QueryBuilder): string;
    quoteSchemaName(quoteSchemaName: string): string;
    compileUpdate(builder: QueryBuilder, values: any): string;
    distinct(distinct: boolean | any[]): string;
    compileInsertOrIgnore(builder: QueryBuilder, values: any): string;
    compileInsertGetId(
        query: QueryBuilder,
        values: any[],
        sequence?: string
    ): string;
    quoteColumnName(columnName: string): string;
    quoteTableName(tableName: string): string;
    _prepareUpdateAst(builder: QueryBuilder, values: any): UpdateSpecification;
    protected _prepareDeleteAstWithJoins(
        builder: QueryBuilder
    ): DeleteSpecification;
    setTablePrefix(prefix: string): this;
}
