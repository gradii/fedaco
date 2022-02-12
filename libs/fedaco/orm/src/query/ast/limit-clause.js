import { SqlNode } from '../sql-node'
export class LimitClause extends SqlNode {
  constructor(value) {
    super()
    this.value = value
  }
  accept(visitor) {
    return visitor.visitLimitClause(this)
  }
}
