/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { RawExpression } from './expression/raw-expression';
import type { IndexBy } from './index-by';
import type { TableReferenceExpression } from './table-reference-expression';


export class FromTable extends SqlNode {
  protected _cached: string;

  constructor(public table: TableReferenceExpression | RawExpression,
              public indexBy?: IndexBy) {
    super();
  }

  accept(visitor: SqlVisitor) {
    if (!this._cached) {
      this._cached = visitor.visitFromTable(this);
    }
    return this._cached;
  }
}
