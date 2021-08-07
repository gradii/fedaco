import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';


export class LockClause extends SqlNode {
  constructor(
    public value: boolean | string,
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitLockClause(this);
  }
}