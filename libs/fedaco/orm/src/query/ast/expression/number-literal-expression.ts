import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';


export class NumberLiteralExpression extends SqlNode {

  constructor(
    public value: number
  ) {
    super();
  }

  get text() {
    return this.value.toString();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitNumberLiteralExpression(this);
  }
}