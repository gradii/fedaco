/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ColumnReferenceExpression } from '../../query/ast/column-reference-expression';
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { LockClause } from '../../query/ast/lock-clause';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { QueryBuilderVisitor } from './query-builder-visitor';
export declare class PostgresQueryBuilderVisitor extends QueryBuilderVisitor {
    constructor(_grammar: GrammarInterface, 
    /**
     * @deprecated
     * todo remove queryBuilder. should use binding only
     */
    _queryBuilder: QueryBuilder);
    visitFunctionCallExpression(node: FunctionCallExpression): string;
    visitComparisonExpression(node: ComparisonPredicateExpression): string;
    visitColumnReferenceExpression(node: ColumnReferenceExpression): string;
    visitLockClause(node: LockClause): string;
}
