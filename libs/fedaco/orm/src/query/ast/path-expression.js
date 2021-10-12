import { SqlNode } from '../sql-node';

export class PathExpression extends SqlNode {
  constructor(paths) {
    super();
    this.paths = paths;
  }

  accept(visitor) {
    return visitor.visitPathExpression(this);
  }
}
