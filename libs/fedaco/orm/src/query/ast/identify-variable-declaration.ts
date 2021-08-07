import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { IndexBy } from './index-by';
import { RangeVariableDeclaration } from './range-variable-declaration';

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
