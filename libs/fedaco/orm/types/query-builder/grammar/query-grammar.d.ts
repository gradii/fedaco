/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { BaseGrammar } from '../../base-grammar';
import { DeleteSpecification } from '../../query/ast/delete-specification';
import { NestedExpression } from '../../query/ast/fragment/nested-expression';
import { QuerySpecification } from '../../query/ast/query-specification';
import { UpdateSpecification } from '../../query/ast/update-specification';
import { SqlNode } from '../../query/sql-node';
import { SqlVisitor } from '../../query/sql-visitor';
import { Builder } from '../builder';
import { GrammarInterface } from '../grammar.interface';
import { JoinClauseBuilder, QueryBuilder } from '../query-builder';
import { QueryBuilderVisitor } from '../visitor/query-builder-visitor';
export declare abstract class QueryGrammar extends BaseGrammar implements GrammarInterface<QueryBuilder> {
    constructor();
    protected _selectComponents: string[];
    protected _prepareUpdateAst(builder: QueryBuilder, values: any): UpdateSpecification;
    compileAggregateFragment(aggregateFunctionName: any, aggregateColumns: any, visitor: SqlVisitor): string;
    compileDelete(query: QueryBuilder): string;
    compileExists(builder: QueryBuilder): string;
    compileInsert(builder: QueryBuilder, values: any | any[], insertOption?: string): string;
    compileInsertGetId(builder: QueryBuilder, values: any, sequence: string): string;
    compileInsertOrIgnore(builder: QueryBuilder, values: any | any[]): string;
    compileInsertUsing(builder: QueryBuilder, columns: string[], nestedExpression: NestedExpression): string;
    compileJoinFragment(builder: JoinClauseBuilder, visitor: SqlVisitor): string;
    compileNestedPredicate(builder: Builder, visitor: SqlVisitor): string;
    compileSelect(builder: Builder): string;
    protected wrapUnion(sql: string): string;
    protected compileUnionAggregate(builder: Builder): string;
    protected concatenate(segments: any[]): string;
    protected compileUnions(builder: Builder): string;
    /**
     * Compile the components necessary for a select clause.
     *
     * @param  \Illuminate\Database\Query\Builder  $query
     * @return array
     */
    protected compileComponents(builder: Builder): string;
    compileTruncate(builder: QueryBuilder): {
        [sql: string]: any[];
    };
    compileUpdate(builder: QueryBuilder, values: any): string;
    compileUpsert(builder: Builder, values: any, uniqueBy: any[] | string, update: any[] | null): string;
    compilePredicateFuncName(funcName: string): string;
    distinct(distinct: boolean | any[]): string;
    getOperators(): any[];
    prepareBindingsForUpdate(builder: Builder, visitor: SqlVisitor): string;
    prepareBindingForJsonContains(value: any): string;
    quoteColumnName(columnName: string): string;
    quoteSchemaName(schemaName: string): string;
    quoteTableName(tableName: string): string;
    setTablePrefix(prefix: string): this;
    wrap(column: string): string;
    protected _prepareAggregateAst(builder: QueryBuilder, ast: SqlNode): QuerySpecification;
    protected _prepareSelectAst(builder: QueryBuilder): QuerySpecification;
    protected _createVisitor(queryBuilder: QueryBuilder): QueryBuilderVisitor;
    protected _prepareDeleteAstWithoutJoins(builder: QueryBuilder): DeleteSpecification;
    protected _prepareDeleteAstWithJoins(builder: QueryBuilder): DeleteSpecification;
    getDateFormat(): string;
    /**
     * Determine if the grammar supports savepoints.
     */
    supportsSavepoints(): boolean;
    compileSavepoint(name: string): string;
    /**
     * Compile the SQL statement to execute a savepoint rollback.
     */
    compileSavepointRollBack(name: string): string;
}
