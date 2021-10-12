import { SqlNode } from '../sql-node';

export class SetClause extends SqlNode {
  constructor() {
    super();
  }

  accept(visitor) {
    return visitor.visitSetClause(this);
  }
}
