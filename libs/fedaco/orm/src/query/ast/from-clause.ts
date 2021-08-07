/**
 * FromClause ::= "FROM" IdentificationVariableDeclaration {"," IdentificationVariableDeclaration}
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { FromTable } from './from-table';
import { JoinedTable } from './joined-table';

/**
 * array of identifyVariableDeclarations is a alia for cross join
 */
export class FromClause extends SqlNode {
  public constructor(
    public from: FromTable,
    public joins: JoinedTable[] = []
  ) {
    super();
  }

  public accept(sqlVisitor: SqlVisitor) {
    return sqlVisitor.visitFromClause(this);
  }
}
