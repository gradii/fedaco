/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { BinaryUnionQueryExpression } from '../../query/ast/binary-union-query-expression';
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { QueryBuilderVisitor } from './query-builder-visitor';
export declare class SqliteQueryBuilderVisitor extends QueryBuilderVisitor {
    constructor(_grammar: GrammarInterface, 
    /**
     * @deprecated
     * todo remove queryBuilder. should use binding only
     */
    _queryBuilder: QueryBuilder);
    visitBinaryUnionQueryExpression(node: BinaryUnionQueryExpression): string;
    visitFunctionCallExpression(node: FunctionCallExpression): string;
    visitComparisonExpression(node: ComparisonPredicateExpression): string;
}
