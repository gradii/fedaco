/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { QueryBuilder } from '../../../query-builder/query-builder';
import { SqlNode } from '../../sql-node';
import type { SqlVisitor } from '../../sql-visitor';
import type { BindingVariable } from '../binding-variable';
import type { RawExpression } from '../expression/raw-expression';
import type { FedacoBuilder } from '../../../fedaco/fedaco-builder';
import type { Relation } from '../../../fedaco/relations/relation';

export class NestedExpression extends SqlNode {
  constructor(
    public type: string,
    public expression: FedacoBuilder | Relation | QueryBuilder | RawExpression | string,
    public bindings: BindingVariable[] = [],
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitNestedExpression(this);
  }
}
