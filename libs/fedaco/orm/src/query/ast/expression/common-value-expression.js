/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Expression } from './expression'
export class CommonValueExpression extends Expression {
  constructor() {
    super()
  }
  accept(visitor) {
    return visitor.visitCommonValueExpression(this)
  }
}
