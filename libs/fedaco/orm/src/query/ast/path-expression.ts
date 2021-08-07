import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { FromTable } from './from-table';
import { Identifier } from './identifier';

//MultiPartIdentifier
export class PathExpression extends SqlNode {

  constructor(public paths: Array<FromTable | Identifier>) {
    super();
  }

  public accept(visitor: SqlVisitor) {
    return visitor.visitPathExpression(this);
  }
}