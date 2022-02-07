/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../query/sql-node';
import { SqlVisitor } from '../query/sql-visitor';
import { GrammarInterface } from './grammar.interface';
/**
 *
 */
export declare class QueryBuilderResolverVisitor implements SqlVisitor {
    private _grammar;
    _isVisitUpdateSpecification: boolean;
    constructor(_grammar: GrammarInterface);
    visitDeleteSpecification(node: SqlNode): string;
    visitAssignmentSetClause(node: SqlNode): string;
    visitSelectInsertSource(node: SqlNode): string;
    visitSetClause(node: SqlNode): string;
    visitUpdateSpecification(node: SqlNode): string;
    visitValuesInsertSource(node: SqlNode): string;
    visitLockClause(node: SqlNode): string;
    visitRejectOrderElementExpression(node: SqlNode): string;
    visitAggregateFragment(node: SqlNode): string;
    visitInsertSpecification(node: SqlNode): string;
    visitBetweenPredicateExpression(node: SqlNode): string;
    visitBinaryExpression(node: SqlNode): string;
    visitBinaryUnionQueryExpression(node: SqlNode): string;
    visitBindingVariable(node: SqlNode): string;
    visitCommonValueExpression(node: SqlNode): string;
    visitComparisonExpression(node: SqlNode): string;
    visitConditionExpression(node: SqlNode): string;
    visitConditionTermExpression(node: SqlNode): string;
    visitExistsPredicateExpression(node: SqlNode): string;
    visitFieldAsExpression(node: SqlNode): string;
    visitFromTable(node: SqlNode): string;
    visitFunctionCallExpression(node: SqlNode): string;
    visitGroupByClause(node: SqlNode): string;
    visitHavingClause(node: SqlNode): string;
    visitInPredicateExpression(node: SqlNode): string;
    visitJoinExpression(node: SqlNode): string;
    visitJoinFragment(node: SqlNode): string;
    visitJoinOnExpression(node: SqlNode): string;
    visitJoinedTable(node: SqlNode): string;
    visitJsonPathColumn(node: SqlNode): string;
    visitJsonPathExpression(node: SqlNode): string;
    visitLimitClause(node: SqlNode): string;
    visitNestedExpression(node: SqlNode): string;
    visitNestedPredicateExpression(node: SqlNode): string;
    visitNullPredicateExpression(node: SqlNode): string;
    visitNumberLiteralExpression(node: SqlNode): string;
    visitOffsetClause(node: SqlNode): string;
    visitOrderByClause(node: SqlNode): string;
    visitOrderByElement(node: SqlNode): string;
    visitParenthesizedExpression(node: SqlNode): string;
    visitRawBindingExpression(node: SqlNode): string;
    visitRawExpression(node: SqlNode): string | number | boolean;
    visitSelectScalarExpression(node: SqlNode): string;
    visitStringLiteralExpression(node: SqlNode): string;
    visitTableName(node: SqlNode): string;
    visitTableReferenceExpression(node: SqlNode): string;
    visitUnionFragment(node: SqlNode): string;
    visitWhereClause(node: SqlNode): string;
    visitAsExpression(node: SqlNode): string;
    visitFromClause(node: SqlNode): string;
    visitIdentifier(node: SqlNode): string;
    visitIdentifyVariableDeclaration(node: SqlNode): string;
    visitJoinClause(node: SqlNode): string;
    visitNodePart(node: SqlNode): string;
    visitPathExpression(node: SqlNode): string;
    visitRangeVariableDeclaration(node: SqlNode): string;
    visitSelectClause(node: SqlNode): string;
    visitColumnReferenceExpression(node: SqlNode): string;
    visitQuerySpecification(node: SqlNode): string;
    visitNotExpression(node: SqlNode): string;
    visitIndexBy(node: SqlNode): string;
}
