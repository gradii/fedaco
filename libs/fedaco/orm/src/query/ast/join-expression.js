import { SqlNode } from '../sql-node'
export class JoinExpression extends SqlNode {
  constructor(type = 'inner', name, on) {
    super()
    this.type = type
    this.name = name
    this.on = on
  }
  accept(visitor) {
    return visitor.visitJoinExpression(this)
  }
}
