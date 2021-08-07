import { ForwardRefFn } from '../../query-builder/forward-ref';
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';


export class Identifier extends SqlNode {
  constructor(
    public name: string | ForwardRefFn<string>
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitIdentifier(this);
  }
}