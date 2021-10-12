import { SqlNode } from '../sql-node';

export class IdentifyVariableDeclaration extends SqlNode {
  constructor(rangeVariableDeclaration, indexBy, joins = []) {
    super();
    this.rangeVariableDeclaration = rangeVariableDeclaration;
    this.indexBy = indexBy;
    this.joins = joins;
  }

  accept(sqlVisitor) {
    return sqlVisitor.visitIdentifyVariableDeclaration(this);
  }
}
