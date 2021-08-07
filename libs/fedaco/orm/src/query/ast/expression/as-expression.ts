import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
import { Identifier } from '../identifier';
import { Expression } from './expression';

export class AsExpression extends SqlNode {

  constructor(
    public name: Expression,
    public as: Identifier
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitAsExpression(this);
  }
}