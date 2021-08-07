import { SqlNode } from './sql-node';


export interface SqlVisitor {

  // visit(node: SqlNode) {
  // }

  visitAggregateFragment(node: SqlNode)

  visitAsExpression(node: SqlNode)

  visitDeleteSpecification(node: SqlNode)

  visitAssignmentSetClause(node: SqlNode)

  visitBetweenPredicateExpression(node: SqlNode)

  visitBinaryExpression(node: SqlNode)

  visitBinaryUnionQueryExpression(node: SqlNode)

  visitBindingVariable(node: SqlNode)

  visitColumnReferenceExpression(node: SqlNode)

  visitCommonValueExpression(node: SqlNode)

  visitComparisonExpression(node: SqlNode)

  visitConditionExpression(node: SqlNode)

  visitConditionTermExpression(node: SqlNode)

  visitExistsPredicateExpression(node: SqlNode)

  visitFieldAsExpression(node: SqlNode)

  visitFromClause(node: SqlNode)

  visitFromTable(node: SqlNode)

  visitFunctionCallExpression(node: SqlNode)

  visitGroupByClause(node: SqlNode)

  visitHavingClause(node: SqlNode)

  visitIdentifier(node: SqlNode)

  visitIdentifyVariableDeclaration(node: SqlNode)

  visitInPredicateExpression(node: SqlNode)

  visitInsertSpecification(node: SqlNode)

  visitJoinClause(node: SqlNode)

  visitJoinExpression(node: SqlNode)

  visitJoinFragment(node: SqlNode)

  visitJoinOnExpression(node: SqlNode)

  visitJoinedTable(node: SqlNode)

  visitJsonPathColumn(node: SqlNode)

  visitJsonPathExpression(node: SqlNode)

  visitLimitClause(node: SqlNode)

  visitNestedExpression(node: SqlNode)

  visitNestedPredicateExpression(node: SqlNode)

  visitNodePart(node: SqlNode)

  visitNullPredicateExpression(node: SqlNode)

  visitNumberLiteralExpression(node: SqlNode)

  visitOffsetClause(node: SqlNode)

  visitOrderByClause(node: SqlNode)

  visitOrderByElement(node: SqlNode)

  visitParenthesizedExpression(node: SqlNode)

  visitPathExpression(node: SqlNode)

  visitQuerySpecification(node: SqlNode)

  visitRangeVariableDeclaration(node: SqlNode)

  visitRawBindingExpression(node: SqlNode)

  visitRawExpression(node: SqlNode)

  visitSelectClause(node: SqlNode)

  visitSelectInsertSource(node: SqlNode)

  visitSelectScalarExpression(node: SqlNode)

  visitSetClause(node: SqlNode)

  visitStringLiteralExpression(node: SqlNode)

  visitTableName(node: SqlNode)

  visitTableReferenceExpression(node: SqlNode)

  visitUnionFragment(node: SqlNode)

  visitUpdateSpecification(node: SqlNode)

  visitValuesInsertSource(node: SqlNode)

  visitWhereClause(node: SqlNode)

  visitLockClause(node: SqlNode)
}