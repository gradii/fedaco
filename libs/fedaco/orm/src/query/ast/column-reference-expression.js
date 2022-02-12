/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'
export class ColumnReferenceExpression extends SqlNode {
  constructor(
    expression,
    fieldAliasIdentificationVariable,
    hiddenAliasResultVariable = false
  ) {
    super()
    this.expression = expression
    this.fieldAliasIdentificationVariable = fieldAliasIdentificationVariable
    this.hiddenAliasResultVariable = hiddenAliasResultVariable
  }
  accept(sqlVisitor) {
    return sqlVisitor.visitColumnReferenceExpression(this)
  }
}
