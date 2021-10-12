import { SqlNode } from '../../../sql-node';

export class RejectOrderElementExpression extends SqlNode {
  constructor(columns, orderByElements) {
    super();
    this.columns = columns;
    this.orderByElements = orderByElements;
  }

  accept(visitor) {
    return visitor.visitRejectOrderElementExpression(this);
  }
}
