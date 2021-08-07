import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';


export class OffsetClause extends SqlNode {
  constructor(
    public offset: number
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitOffsetClause(this);
  }
}