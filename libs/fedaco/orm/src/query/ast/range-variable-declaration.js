import { SqlNode } from '../sql-node';

export class RangeVariableDeclaration extends SqlNode {
  constructor(abstractSchemaName, aliasIdentificationVariable, isRoot = true) {
    super();
    this.abstractSchemaName = abstractSchemaName;
    this.aliasIdentificationVariable = aliasIdentificationVariable;
    this.isRoot = isRoot;
  }

  get name() {
    if (this.aliasIdentificationVariable) {
      return this.aliasIdentificationVariable;
    } else {
      return this.abstractSchemaName;
    }
  }

  accept(visitor) {
    return visitor.visitRangeVariableDeclaration(this);
  }
}
