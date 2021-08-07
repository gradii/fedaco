import { QueryBuilder } from '../../../query-builder/query-builder';
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
import { BindingVariable } from '../binding-variable';
import { RawExpression } from '../expression/raw-expression';


export class NestedExpression extends SqlNode {
  constructor(
    public type: string,
    public expression: QueryBuilder | RawExpression | string,
    public bindings: BindingVariable[] = [],
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitNestedExpression(this);
  }
}