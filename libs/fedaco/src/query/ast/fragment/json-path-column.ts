/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../../sql-node';
import type { SqlVisitor } from '../../sql-visitor';
import { Identifier } from '../identifier';
import type { JsonPathExpression } from '../json-path-expression';
import type { PathExpression } from '../path-expression';


/**
 * @deprecated check if this is still used
 */
export class JsonPathColumn extends SqlNode {
  constructor(
    public columns: PathExpression,
    public jsonPaths: JsonPathExpression
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitJsonPathColumn(this);
  }
}
