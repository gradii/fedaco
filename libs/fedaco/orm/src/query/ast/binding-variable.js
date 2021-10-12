import { SqlNode } from '../sql-node';

export class BindingVariable extends SqlNode {
  constructor(bindingExpression, type = 'where') {
    super();
    this.bindingExpression = bindingExpression;
    this.type = type;
  }

  accept(visitor) {
    return visitor.visitBindingVariable(this);
  }
}
