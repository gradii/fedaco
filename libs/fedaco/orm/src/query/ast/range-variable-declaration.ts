import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';

/**
 * RangeVariableDeclaration ::= AbstractSchemaName ["AS"] AliasIdentificationVariable
 */
export class RangeVariableDeclaration extends SqlNode {

  public constructor(public abstractSchemaName: string,
                     public aliasIdentificationVariable?: string,
                     public isRoot: boolean = true) {
    super();
  }

  public get name() {
    if (this.aliasIdentificationVariable) {
      return this.aliasIdentificationVariable;
    } else {
      return this.abstractSchemaName;
    }
  };

  public accept(visitor: SqlVisitor) {
    return visitor.visitRangeVariableDeclaration(this);
  }
}
