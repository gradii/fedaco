import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { RawExpression } from './expression/raw-expression';
import { IndexBy } from './index-by';
import { TableReferenceExpression } from './table-reference-expression';


export class FromTable extends SqlNode {
  constructor(public table: TableReferenceExpression | RawExpression,
              public indexBy?: IndexBy) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitFromTable(this);
  }
}