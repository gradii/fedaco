import { SqlNode } from '../../sql-node'
export class NumberLiteralExpression extends SqlNode {
  constructor(value) {
    super()
    this.value = value
  }
  get text() {
    return this.value.toString()
  }
  accept(visitor) {
    return visitor.visitNumberLiteralExpression(this)
  }
}
