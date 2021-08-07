import { JoinQueryBuilder } from '../../../query-builder/query-builder';
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';


export class JoinFragment extends SqlNode {
  constructor(
    public joinQueryBuilder: JoinQueryBuilder
  ) {
    super();
  }

  public accept(visitor: SqlVisitor) {
    return visitor.visitJoinFragment(this)
  }
}