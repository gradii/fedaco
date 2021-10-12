import { SqlNode } from '../sql-node';

export class Identifier extends SqlNode {
  constructor(name) {
    super();
    this.name = name;
  }

  accept(visitor) {
    return visitor.visitIdentifier(this);
  }
}
