/**
 * SelectClause = "SELECT" ["DISTINCT"] ColumnExpression {"," ColumnExpression}
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { ColumnReferenceExpression } from './column-reference-expression';
import { RawBindingExpression } from './expression/raw-binding-expression';
import { RawExpression } from './expression/raw-expression';
import { SelectScalarExpression } from './select-scalar-expression';

export class SelectClause extends SqlNode {

  public constructor(public selectExpressions: Array<ColumnReferenceExpression |
                       SelectScalarExpression | RawExpression | RawBindingExpression>        = [],
                     public distinct: boolean | any[] = false) {
    super();
  }

  public accept(sqlVisitor: SqlVisitor) {
    return sqlVisitor.visitSelectClause(this);
  }

}
