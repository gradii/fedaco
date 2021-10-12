import { SqlNode } from '../../sql-node';

export class StringLiteralExpression extends SqlNode {
  constructor(value) {
    super();
    this.value = value;
  }

  get text() {
    return this.value.toString();
  }

  accept(visitor) {
    return visitor.visitStringLiteralExpression(this);
  }
}
