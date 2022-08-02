/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

/**
 * SelectClause = "SELECT" ["DISTINCT"] ColumnExpression {"," ColumnExpression}
 */
import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { ColumnReferenceExpression } from './column-reference-expression';
import type { RawBindingExpression } from './expression/raw-binding-expression';
import type { RawExpression } from './expression/raw-expression';
import type { SelectScalarExpression } from './select-scalar-expression';

export class SelectClause extends SqlNode {

  public constructor(public selectExpressions: Array<ColumnReferenceExpression |
                       SelectScalarExpression | RawExpression | RawBindingExpression> = [],
                     public distinct: boolean | any[]                                 = false) {
    super();
  }

  public accept(sqlVisitor: SqlVisitor) {
    return sqlVisitor.visitSelectClause(this);
  }

}
