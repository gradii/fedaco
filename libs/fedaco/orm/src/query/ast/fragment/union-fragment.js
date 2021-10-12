import { SqlNode } from '../../sql-node';

export class UnionFragment extends SqlNode {
  constructor(expression, all) {
    super();
    this.expression = expression;
    this.all = all;
  }

  accept(visitor) {
    return visitor.visitUnionFragment(this);
  }
}
