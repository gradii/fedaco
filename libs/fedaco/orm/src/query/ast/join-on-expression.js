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
