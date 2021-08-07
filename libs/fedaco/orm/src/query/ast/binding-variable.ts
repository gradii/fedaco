import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';


export class BindingVariable extends SqlNode {
  constructor(
    public bindingExpression: SqlNode,
    public type = 'where'
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitBindingVariable(this);
  }
}