import { createKeyword } from '../../query-builder/ast-factory';
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { JoinOnExpression } from './join-on-expression';
import { Identifier } from './identifier';
import { JoinedTable } from './joined-table';
import { PathExpression } from './path-expression';
import { TableReferenceExpression } from './table-reference-expression';


export class JoinExpression extends SqlNode {
  constructor(
    public type = 'inner',
    public name: TableReferenceExpression | PathExpression | Identifier | JoinedTable,
    public on?: JoinOnExpression
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitJoinExpression(this);
  }

}

