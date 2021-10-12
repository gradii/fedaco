import { SqlNode } from '../sql-node';

export class TableReferenceExpression extends SqlNode {
  constructor(expression, alias) {
    super();
    this.expression = expression;
    this.alias = alias;
  }

  accept(visitor) {
    return visitor.visitTableReferenceExpression(this);
  }
}
