/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { RawExpression } from './raw-expression'
export class RawBindingExpression extends RawExpression {
  constructor(raw, bindings) {
    super(raw.value)
    this.raw = raw
    this.bindings = bindings
  }
  accept(visitor) {
    return visitor.visitRawBindingExpression(this)
  }
}
