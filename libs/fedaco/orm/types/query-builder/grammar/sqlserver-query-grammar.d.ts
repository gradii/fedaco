/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { DeleteSpecification } from '../../query/ast/delete-specification';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { SqlserverQueryBuilderVisitor } from '../visitor/sqlserver-query-builder-visitor';
import { QueryGrammar } from './query-grammar';
export declare class SqlserverQueryGrammar
    extends QueryGrammar
    implements GrammarInterface
{
    private _tablePrefix;
    compileSelect(builder: QueryBuilder): string;
    compileUpdate(builder: QueryBuilder, values: any): string;
    compileInsertOrIgnore(builder: QueryBuilder, values: any): string;
    compilePredicateFuncName(funcName: string): string;
    distinct(distinct: boolean | any[]): string;
    prepareBindingForJsonContains(value: any): string;
    quoteColumnName(columnName: string): string;
    quoteTableName(tableName: string): string;
    setTablePrefix(prefix: string): this;
    compileInsertGetId(
        builder: QueryBuilder,
        values: any,
        sequence: string
    ): string;
    protected _createVisitor(
        queryBuilder: QueryBuilder
    ): SqlserverQueryBuilderVisitor;
    protected _prepareDeleteAstWithJoins(
        builder: QueryBuilder
    ): DeleteSpecification;
}
