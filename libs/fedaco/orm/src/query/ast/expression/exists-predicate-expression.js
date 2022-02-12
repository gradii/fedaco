/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Expression } from './expression'
export class ExistsPredicateExpression extends Expression {
  constructor(expression, not = false) {
    super()
    this.expression = expression
    this.not = not
  }
  accept(visitor) {
    return visitor.visitExistsPredicateExpression(this)
  }
}
