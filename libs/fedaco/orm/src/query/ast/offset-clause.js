import { SqlNode } from '../sql-node';

export class OffsetClause extends SqlNode {
  constructor(offset) {
    super();
    this.offset = offset;
  }

  accept(visitor) {
    return visitor.visitOffsetClause(this);
  }
}
