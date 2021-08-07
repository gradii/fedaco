import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
import { Identifier } from '../identifier';


export class AggregateFragment extends SqlNode {
  constructor(
    public aggregateFunctionName: Identifier,
    public aggregateColumns: SqlNode[]
  ) {
    super();
  }

  public accept(visitor: SqlVisitor) {
    return visitor.visitAggregateFragment(this)
  }
}