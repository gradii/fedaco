/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';

/**
 * RangeVariableDeclaration ::= AbstractSchemaName ["AS"] AliasIdentificationVariable
 */
export class RangeVariableDeclaration extends SqlNode {
  public constructor(
    public abstractSchemaName: string,
    public aliasIdentificationVariable?: string,
    public isRoot = true,
  ) {
    super();
  }

  public get name() {
    if (this.aliasIdentificationVariable) {
      return this.aliasIdentificationVariable;
    } else {
      return this.abstractSchemaName;
    }
  }

  public accept(visitor: SqlVisitor) {
    return visitor.visitRangeVariableDeclaration(this);
  }
}
