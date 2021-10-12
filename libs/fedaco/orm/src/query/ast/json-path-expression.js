import { SqlNode } from '../sql-node';

export class JsonPathExpression extends SqlNode {
  constructor(paths) {
    super();
    this.paths = paths;
  }

  accept(visitor) {
    return visitor.visitJsonPathExpression(this);
  }
}
