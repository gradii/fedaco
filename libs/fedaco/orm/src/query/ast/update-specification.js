import { SqlNode } from '../sql-node'
export class UpdateSpecification extends SqlNode {
  constructor(
    target,
    setClauses,
    whereClause,
    fromClause,
    orderByClause,
    offsetClause,
    limitClause
  ) {
    super()
    this.target = target
    this.setClauses = setClauses
    this.whereClause = whereClause
    this.fromClause = fromClause
    this.orderByClause = orderByClause
    this.offsetClause = offsetClause
    this.limitClause = limitClause
  }
  accept(visitor) {
    visitor._isVisitUpdateSpecification = true
    const rst = visitor.visitUpdateSpecification(this)
    visitor._isVisitUpdateSpecification = false
    return rst
  }
}
