/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { IndexBy } from './index-by';
import type { RangeVariableDeclaration } from './range-variable-declaration';

/**
 * IdentificationVariableDeclaration ::= RangeVariableDeclaration [IndexBy] {JoinVariableDeclaration}*
 */

export class IdentifyVariableDeclaration extends SqlNode {

  public constructor(public rangeVariableDeclaration: RangeVariableDeclaration,
                     public indexBy?: IndexBy,
                     public joins: any[] = []) {
    super();
  }

  public accept(sqlVisitor: SqlVisitor): string {
    return sqlVisitor.visitIdentifyVariableDeclaration(this);
  }
}
