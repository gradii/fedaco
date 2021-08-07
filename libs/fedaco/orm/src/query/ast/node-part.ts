import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';

/**
 * node part is like a source file. it contains imports exports.
 */
export class NodePart<T extends SqlNode = SqlNode> extends SqlNode {
  constructor(
    public part: T,
    public references: any[],
    public declarations: any[]
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitNodePart(this);
  }
}