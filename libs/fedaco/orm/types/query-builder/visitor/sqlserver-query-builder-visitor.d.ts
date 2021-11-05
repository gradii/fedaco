/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { BinaryUnionQueryExpression } from '../../query/ast/binary-union-query-expression';
import { DeleteSpecification } from '../../query/ast/delete-specification';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { LockClause } from '../../query/ast/lock-clause';
import { OffsetClause } from '../../query/ast/offset-clause';
import { QueryExpression } from '../../query/ast/query-expression';
import { QuerySpecification } from '../../query/ast/query-specification';
import { SelectClause } from '../../query/ast/select-clause';
import { UpdateSpecification } from '../../query/ast/update-specification';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { QueryBuilderVisitor } from './query-builder-visitor';
export declare class SqlserverQueryBuilderVisitor extends QueryBuilderVisitor {
    private _limitToTop;
    constructor(_grammar: GrammarInterface, 
    /**
     * @deprecated
     * todo remove queryBuilder. should use binding only
     */
    _queryBuilder: QueryBuilder);
    visitQuerySpecification(node: QuerySpecification): string;
    visitQueryExpression(node: QueryExpression): string;
    visitSelectClause(node: SelectClause): string;
    visitOffsetClause(node: OffsetClause): string;
    visitDeleteSpecification(node: DeleteSpecification): any;
    visitBinaryUnionQueryExpression(node: BinaryUnionQueryExpression): any;
    visitFunctionCallExpression(node: FunctionCallExpression): string;
    visitUpdateSpecification(node: UpdateSpecification): string;
    visitLockClause(node: LockClause): string;
}
