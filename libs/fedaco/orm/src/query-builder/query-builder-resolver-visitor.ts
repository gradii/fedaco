import { SqlNode } from '../query/sql-node';
import { SqlVisitor } from '../query/sql-visitor';
import { GrammarInterface } from './grammar.interface';

/**
 *
 */
export class QueryBuilderResolverVisitor implements SqlVisitor {

  constructor(private _grammar: GrammarInterface) {

  }

  visitAggregateFragment(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitInsertSpecification(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitBetweenPredicateExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitBinaryExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitBinaryUnionQueryExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitBindingVariable(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitCommonValueExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitComparisonExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitConditionExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitConditionTermExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitExistsPredicateExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitFieldAsExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitFromTable(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitFunctionCallExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitGroupByClause(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitHavingClause(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitInPredicateExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitJoinExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitJoinFragment(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitJoinOnExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitJoinedTable(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitJsonPathColumn(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitJsonPathExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitLimitClause(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitNestedExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitNestedPredicateExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitNullPredicateExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitNumberLiteralExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitOffsetClause(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitOrderByClause(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitOrderByElement(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitParenthesizedExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitRawBindingExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitRawExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitSelectScalarExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitStringLiteralExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitTableName(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitTableReferenceExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitUnionFragment(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitWhereClause(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitAsExpression(node: SqlNode) {
  }

  visitFromClause(node: SqlNode) {
  }

  visitIdentifier(node: SqlNode) {
  }

  visitIdentifyVariableDeclaration(node: SqlNode) {
  }

  visitJoinClause(node: SqlNode) {
  }

  visitNodePart(node: SqlNode) {
  }

  visitPathExpression(node: SqlNode) {
  }

  visitRangeVariableDeclaration(node: SqlNode) {
  }

  visitSelectClause(node: SqlNode) {
  }

  visitColumnReferenceExpression(node: SqlNode) {
  }

  visitQuerySpecification(node: SqlNode) {
  }


}