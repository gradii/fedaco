/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { SqlVisitor } from '../../sql-visitor';
import type { BindingVariable } from '../binding-variable';
import { RawExpression } from './raw-expression';


export class RawBindingExpression extends RawExpression {
  constructor(
    public raw: RawExpression,
    public bindings: BindingVariable[]
  ) {
    super(raw.value);
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitRawBindingExpression(this);
  }
}
