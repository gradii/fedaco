import { SqlNode } from '../sql-node'
export class SetClause extends SqlNode {
  constructor() {
    super()
  }
  accept(visitor, ctx) {
    return visitor.visitSetClause(this, ctx)
  }
}
