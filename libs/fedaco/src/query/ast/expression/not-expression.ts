/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { SqlVisitor } from '../../sql-visitor';
import { Identifier } from '../identifier';
import { Expression } from './expression';

export class NotExpression extends Expression {
  constructor(
    public expression: Expression
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitNotExpression(this);
  }
}
