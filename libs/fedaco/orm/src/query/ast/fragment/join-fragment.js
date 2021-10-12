import { SqlNode } from '../../sql-node';

export class JoinFragment extends SqlNode {
  constructor(joinQueryBuilder) {
    super();
    this.joinQueryBuilder = joinQueryBuilder;
  }

  accept(visitor) {
    return visitor.visitJoinFragment(this);
  }
}
