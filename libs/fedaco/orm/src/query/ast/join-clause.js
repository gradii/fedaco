import { SqlNode } from '../sql-node';

export class JoinClause extends SqlNode {
  constructor(joinExpression) {
    super();
    this.joinExpression = joinExpression;
  }

  accept(visitor) {
    return visitor.visitJoinClause(this);
  }
}
