import { SqlNode } from '../sql-node'
export class DeleteSpecification extends SqlNode {
  constructor(
    target,
    whereClause,
    fromClause,
    orderByClause,
    offsetClause,
    limitClause
  ) {
    super()
    this.target = target
    this.whereClause = whereClause
    this.fromClause = fromClause
    this.orderByClause = orderByClause
    this.offsetClause = offsetClause
    this.limitClause = limitClause
  }
  accept(visitor) {
    return visitor.visitDeleteSpecification(this)
  }
}
