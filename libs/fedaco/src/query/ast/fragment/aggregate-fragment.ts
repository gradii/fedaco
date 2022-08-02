/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../../sql-node';
import type { SqlVisitor } from '../../sql-visitor';
import type { Identifier } from '../identifier';


export class AggregateFragment extends SqlNode {
  constructor(
    public aggregateFunctionName: Identifier,
    public aggregateColumns: SqlNode[]
  ) {
    super();
  }

  public accept(visitor: SqlVisitor) {
    return visitor.visitAggregateFragment(this);
  }
}
