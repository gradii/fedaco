import { SqlNode } from '../sql-node'
export class WhereClause extends SqlNode {
  constructor(conditionExpression) {
    super()
    this.conditionExpression = conditionExpression
  }
  accept(visitor) {
    return visitor.visitWhereClause(this)
  }
}
