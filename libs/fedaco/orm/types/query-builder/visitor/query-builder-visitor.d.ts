/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { AssignmentSetClause } from '../../query/ast/assignment-set-clause';
import { BinaryUnionQueryExpression } from '../../query/ast/binary-union-query-expression';
import { BindingVariable } from '../../query/ast/binding-variable';
import { ColumnReferenceExpression } from '../../query/ast/column-reference-expression';
import { DeleteSpecification } from '../../query/ast/delete-specification';
import { AsExpression } from '../../query/ast/expression/as-expression';
import { BetweenPredicateExpression } from '../../query/ast/expression/between-predicate-expression';
import { BinaryExpression } from '../../query/ast/expression/binary-expression';
import { CommonValueExpression } from '../../query/ast/expression/common-value-expression';
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import { ConditionExpression } from '../../query/ast/expression/condition-expression';
import { ExistsPredicateExpression } from '../../query/ast/expression/exists-predicate-expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { InPredicateExpression } from '../../query/ast/expression/in-predicate-expression';
import { NotExpression } from '../../query/ast/expression/not-expression';
import { NullPredicateExpression } from '../../query/ast/expression/null-predicate-expression';
import { NumberLiteralExpression } from '../../query/ast/expression/number-literal-expression';
import { ParenthesizedExpression } from '../../query/ast/expression/parenthesized-expression';
import { RawBindingExpression } from '../../query/ast/expression/raw-binding-expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { StringLiteralExpression } from '../../query/ast/expression/string-literal-expression';
import { AggregateFragment } from '../../query/ast/fragment/aggregate-fragment';
import { NestedPredicateExpression } from '../../query/ast/fragment/expression/nested-predicate-expression';
import { JoinFragment } from '../../query/ast/fragment/join-fragment';
import { JsonPathColumn } from '../../query/ast/fragment/json-path-column';
import { NestedExpression } from '../../query/ast/fragment/nested-expression';
import { RejectOrderElementExpression } from '../../query/ast/fragment/order/reject-order-element-expression';
import { UnionFragment } from '../../query/ast/fragment/union-fragment';
import { FromClause } from '../../query/ast/from-clause';
import { FromTable } from '../../query/ast/from-table';
import { GroupByClause } from '../../query/ast/group-by-clause';
import { HavingClause } from '../../query/ast/having-clause';
import { Identifier } from '../../query/ast/identifier';
import { IdentifyVariableDeclaration } from '../../query/ast/identify-variable-declaration';
import type { IndexBy } from '../../query/ast/index-by';
import { InsertSpecification } from '../../query/ast/insert-specification';
import { JoinClause } from '../../query/ast/join-clause';
import { JoinExpression } from '../../query/ast/join-expression';
import { JoinOnExpression } from '../../query/ast/join-on-expression';
import { JoinedTable } from '../../query/ast/joined-table';
import { JsonPathExpression } from '../../query/ast/json-path-expression';
import { LimitClause } from '../../query/ast/limit-clause';
import { LockClause } from '../../query/ast/lock-clause';
import { NodePart } from '../../query/ast/node-part';
import { OffsetClause } from '../../query/ast/offset-clause';
import { OrderByClause } from '../../query/ast/order-by-clause';
import { OrderByElement } from '../../query/ast/order-by-element';
import { PathExpression } from '../../query/ast/path-expression';
import { QueryExpression } from '../../query/ast/query-expression';
import { QuerySpecification } from '../../query/ast/query-specification';
import { RangeVariableDeclaration } from '../../query/ast/range-variable-declaration';
import { SelectClause } from '../../query/ast/select-clause';
import { SelectInsertSource } from '../../query/ast/select-insert-source';
import { SelectScalarExpression } from '../../query/ast/select-scalar-expression';
import { SetClause } from '../../query/ast/set-clause';
import { TableName } from '../../query/ast/table-name';
import { TableReferenceExpression } from '../../query/ast/table-reference-expression';
import { UpdateSpecification } from '../../query/ast/update-specification';
import { ValuesInsertSource } from '../../query/ast/values-insert-source';
import { WhereClause } from '../../query/ast/where-clause';
import { SqlNode } from '../../query/sql-node';
import { SqlVisitor } from '../../query/sql-visitor';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
export declare class QueryBuilderVisitor implements SqlVisitor {
    protected _grammar: GrammarInterface;
    /**
     * @deprecated
     * todo remove queryBuilder. should use binding only
     */
    protected _queryBuilder: QueryBuilder;
    protected inJoinExpression: boolean;
    protected explicitBindingType: string;
    _isVisitUpdateSpecification: boolean;
    constructor(_grammar: GrammarInterface, 
    /**
     * @deprecated
     * todo remove queryBuilder. should use binding only
     */
    _queryBuilder: QueryBuilder);
    visit(): string;
    visitAggregateFragment(node: AggregateFragment): string;
    visitAsExpression(node: AsExpression): string;
    visitDeleteSpecification(node: DeleteSpecification): string;
    visitAssignmentSetClause(node: AssignmentSetClause): string;
    visitBetweenPredicateExpression(node: BetweenPredicateExpression): string;
    visitBinaryExpression(node: BinaryExpression): string;
    visitBinaryUnionQueryExpression(node: BinaryUnionQueryExpression): string;
    /**
     * todo fixme binding variable
     * generate a placeholder for sql
     * @param node
     */
    visitBindingVariable(node: BindingVariable): string;
    visitColumnReferenceExpression(node: ColumnReferenceExpression): string;
    visitCommonValueExpression(node: CommonValueExpression): string;
    visitComparisonExpression(node: ComparisonPredicateExpression): string;
    /**
     * todo `AND` is not right here.
     * @param node
     */
    visitConditionExpression(node: ConditionExpression): string;
    visitConditionTermExpression(node: SqlNode): string;
    visitExistsPredicateExpression(node: ExistsPredicateExpression): string;
    visitFieldAsExpression(node: SqlNode): string;
    visitFromClause(node: FromClause): string;
    visitFromTable(node: FromTable): string;
    visitFunctionCallExpression(node: FunctionCallExpression): string;
    visitGroupByClause(node: GroupByClause): string;
    visitHavingClause(node: HavingClause): string;
    visitIdentifier(node: Identifier): string;
    /**
     * @deprecated
     * @param node
     */
    visitIdentifyVariableDeclaration(node: IdentifyVariableDeclaration): string;
    visitInPredicateExpression(node: InPredicateExpression): string;
    visitInsertSpecification(node: InsertSpecification): string;
    visitJoinClause(node: JoinClause): string;
    visitJoinExpression(node: JoinExpression): string;
    visitJoinFragment(node: JoinFragment): string;
    visitJoinOnExpression(node: JoinOnExpression): string;
    visitJoinedTable(node: JoinedTable): string;
    visitJsonPathColumn(node: JsonPathColumn): string;
    visitJsonPathExpression(node: JsonPathExpression): string;
    visitLimitClause(node: LimitClause): string;
    visitNestedExpression(node: NestedExpression): string;
    visitNestedPredicateExpression(node: NestedPredicateExpression): string;
    visitNodePart(node: NodePart): string;
    visitNullPredicateExpression(node: NullPredicateExpression): string;
    visitNumberLiteralExpression(node: NumberLiteralExpression): string;
    visitOffsetClause(node: OffsetClause): string;
    visitOrderByClause(node: OrderByClause): string;
    visitOrderByElement(node: OrderByElement, ctx?: any): string;
    visitParenthesizedExpression(node: ParenthesizedExpression): string;
    visitPathExpression(node: PathExpression): string;
    visitQueryExpression(node: QueryExpression): string;
    visitQuerySpecification(node: QuerySpecification): string;
    visitRangeVariableDeclaration(node: RangeVariableDeclaration): string;
    visitRawBindingExpression(node: RawBindingExpression): string;
    visitRawExpression(node: RawExpression): string | number | boolean;
    visitSelectClause(node: SelectClause): string;
    visitSelectInsertSource(node: SelectInsertSource): string;
    visitSelectScalarExpression(node: SelectScalarExpression): string;
    visitSetClause(node: SetClause): string;
    visitStringLiteralExpression(node: StringLiteralExpression): string;
    visitTableName(node: TableName): string;
    visitTableReferenceExpression(node: TableReferenceExpression): string;
    visitUnionFragment(node: UnionFragment): string;
    visitUpdateSpecification(node: UpdateSpecification): string;
    visitValuesInsertSource(node: ValuesInsertSource): string;
    visitWhereClause(node: WhereClause): string;
    visitLockClause(node: LockClause): string;
    visitRejectOrderElementExpression(node: RejectOrderElementExpression, ctx?: any): string;
    visitNotExpression(node: NotExpression): string;
    visitIndexBy(node: IndexBy): string;
}
