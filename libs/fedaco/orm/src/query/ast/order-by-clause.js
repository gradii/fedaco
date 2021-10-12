import { SqlNode } from '../sql-node';

export class OrderByClause extends SqlNode {
  constructor(elements) {
    super();
    this.elements = elements;
  }

  accept(visitor) {
    return visitor.visitOrderByClause(this);
  }
}
