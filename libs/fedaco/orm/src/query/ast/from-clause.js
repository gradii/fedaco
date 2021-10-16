import { SqlNode } from '../sql-node'

export class FromClause extends SqlNode {
  constructor(from, joins = []) {
    super()
    this.from = from
    this.joins = joins
  }
  accept(sqlVisitor) {
    return sqlVisitor.visitFromClause(this)
  }
}
