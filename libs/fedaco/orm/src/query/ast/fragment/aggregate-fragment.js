import { SqlNode } from '../../sql-node'
export class AggregateFragment extends SqlNode {
  constructor(aggregateFunctionName, aggregateColumns) {
    super()
    this.aggregateFunctionName = aggregateFunctionName
    this.aggregateColumns = aggregateColumns
  }
  accept(visitor) {
    return visitor.visitAggregateFragment(this)
  }
}
