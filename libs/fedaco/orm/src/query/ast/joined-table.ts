import { ForwardRefFn } from '../../query-builder/forward-ref';
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { FromTable } from './from-table';
import { JoinExpression } from './join-expression';
import { TableReferenceExpression } from './table-reference-expression';


/**
 */
export class JoinedTable extends SqlNode {
  constructor(
    public from: TableReferenceExpression,
    public joinExpressions: JoinExpression[],
  ) {
    super();
  }

  public accept(sqlVisitor: SqlVisitor) {
    return sqlVisitor.visitJoinedTable(this);
  }
}