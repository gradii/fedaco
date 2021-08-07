import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';


export class SelectInsertSource extends SqlNode {
  constructor() {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitSelectInsertSource(this)
  }
}