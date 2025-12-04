/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { SqlVisitor } from '../../sql-visitor';
import type { Identifier } from '../identifier';
import { Expression } from './expression';

export class FunctionCallExpression extends Expression {
  constructor(
    public name: Identifier,
    public parameters: Expression[],
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitFunctionCallExpression(this);
  }
}
