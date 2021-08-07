import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { OrderByElement } from './order-by-element';


export class OrderByClause extends SqlNode {
  constructor(
    public elements: OrderByElement[]
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitOrderByClause(this);
  }
}