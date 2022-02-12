/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'
export class JoinOnExpression extends SqlNode {
  constructor(columnExpression, operator, rightExpression) {
    super()
    this.columnExpression = columnExpression
    this.operator = operator
    this.rightExpression = rightExpression
  }
  accept(visitor) {
    return visitor.visitJoinOnExpression(this)
  }
}
