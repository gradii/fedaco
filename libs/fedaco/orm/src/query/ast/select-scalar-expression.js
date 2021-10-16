import { SqlNode } from '../sql-node'
export class SelectScalarExpression extends SqlNode {
  constructor(
    expression,

    columnName
  ) {
    super()
    this.expression = expression
    this.columnName = columnName
  }
  accept(visitor) {
    return visitor.visitSelectScalarExpression(this)
  }
}
