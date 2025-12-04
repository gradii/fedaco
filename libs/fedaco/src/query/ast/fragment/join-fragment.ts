/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { JoinClauseBuilder } from '../../../query-builder/query-builder';
import { SqlNode } from '../../sql-node';
import type { SqlVisitor } from '../../sql-visitor';

export class JoinFragment extends SqlNode {
  constructor(public joinQueryBuilder: JoinClauseBuilder) {
    super();
  }

  public accept(visitor: SqlVisitor) {
    return visitor.visitJoinFragment(this);
  }
}
