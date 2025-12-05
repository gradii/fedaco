/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';

export class RawExpression extends Expression {
  constructor(public value: string | number | boolean | null) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitRawExpression(this);
  }
}
