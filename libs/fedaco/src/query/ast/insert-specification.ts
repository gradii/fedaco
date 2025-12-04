/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { FromTable } from './from-table';
import type { QuerySpecification } from './query-specification';
import type { ValuesInsertSource } from './values-insert-source';

export class InsertSpecification extends SqlNode {
  constructor(
    public insertOption: string,
    public insertSource: ValuesInsertSource,
    public columns: SqlNode[],
    public target: QuerySpecification | FromTable,
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitInsertSpecification(this);
  }
}
