/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { SqlNode } from './sql-node';

export interface SqlVisitor {
  _isVisitUpdateSpecification: boolean;

  // visit(node: SqlNode) {
  // }

  visitAggregateFunctionCallFragment(node: SqlNode): string;

  visitAsExpression(node: SqlNode): string;

  visitDeleteSpecification(node: SqlNode): string;

  visitAssignmentSetClause(node: SqlNode): string;

  visitBetweenPredicateExpression(node: SqlNode): string;

  visitBinaryExpression(node: SqlNode): string;

  visitBinaryUnionQueryExpression(node: SqlNode): string;

  visitBindingVariable(node: SqlNode): string;

  visitColumnReferenceExpression(node: SqlNode): string;

  visitCommonValueExpression(node: SqlNode): string;

  visitComparisonExpression(node: SqlNode): string;

  visitConditionExpression(node: SqlNode): string;

  visitConditionTermExpression(node: SqlNode): string;

  visitExistsPredicateExpression(node: SqlNode): string;

  visitFieldAsExpression(node: SqlNode): string;

  visitFromClause(node: SqlNode): string;

  visitFromTable(node: SqlNode): string;

  visitFunctionCallExpression(node: SqlNode): string;

  visitGroupByClause(node: SqlNode): string;

  visitHavingClause(node: SqlNode): string;

  visitIdentifier(node: SqlNode): string;

  visitIdentifyVariableDeclaration(node: SqlNode): string;

  visitInPredicateExpression(node: SqlNode): string;

  visitInsertSpecification(node: SqlNode): string;

  visitJoinClause(node: SqlNode): string;

  visitJoinExpression(node: SqlNode): string;

  visitJoinFragment(node: SqlNode): string;

  visitJoinOnExpression(node: SqlNode): string;

  visitJoinedTable(node: SqlNode): string;

  visitJsonPathColumn(node: SqlNode): string;

  visitJsonPathExpression(node: SqlNode): string;

  visitLimitClause(node: SqlNode): string;

  visitNestedExpression(node: SqlNode): string;

  visitNestedPredicateExpression(node: SqlNode): string;

  visitNodePart(node: SqlNode): string;

  visitNullPredicateExpression(node: SqlNode): string;

  visitNumberLiteralExpression(node: SqlNode): string;

  visitOffsetClause(node: SqlNode): string;

  visitOrderByClause(node: SqlNode): string;

  visitOrderByElement(node: SqlNode, ctx?: any): string;

  visitParenthesizedExpression(node: SqlNode): string;

  visitPathExpression(node: SqlNode): string;

  visitQuerySpecification(node: SqlNode): string;

  visitRangeVariableDeclaration(node: SqlNode): string;

  visitRawBindingExpression(node: SqlNode): string;

  visitRawExpression(node: SqlNode): string | number | boolean;

  visitSelectClause(node: SqlNode): string;

  visitSelectInsertSource(node: SqlNode): string;

  visitSelectScalarExpression(node: SqlNode): string;

  visitSetClause(node: SqlNode, ctx?: any): string;

  visitStringLiteralExpression(node: SqlNode): string;

  visitTableName(node: SqlNode): string;

  visitTableReferenceExpression(node: SqlNode): string;

  visitUnionFragment(node: SqlNode): string;

  visitUpdateSpecification(node: SqlNode): string;

  visitValuesInsertSource(node: SqlNode): string;

  visitWhereClause(node: SqlNode): string;

  visitLockClause(node: SqlNode): string;

  visitRejectOrderElementExpression(node: SqlNode): string;

  visitNotExpression(node: SqlNode): string;

  visitIndexBy(node: SqlNode): string;
}
