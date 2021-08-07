import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';


export class HavingClause extends SqlNode {
  constructor(
    public expressions: SqlNode[],
    public conjunction:string = 'and'
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitHavingClause(this);
  }
}