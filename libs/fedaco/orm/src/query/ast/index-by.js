import { SqlNode } from '../sql-node'

export class IndexBy extends SqlNode {
  constructor(simpleStateFieldPathExpression = null) {
    super()
    this.simpleStateFieldPathExpression = simpleStateFieldPathExpression
  }
  accept(sqlVisitor) {
    return sqlVisitor.visitIndexBy(this)
  }
}
