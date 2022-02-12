/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Expression } from './expression'
export class BetweenPredicateExpression extends Expression {
  constructor(expression, leftBetween, rightBetween, not = false) {
    super()
    this.expression = expression
    this.leftBetween = leftBetween
    this.rightBetween = rightBetween
    this.not = not
  }
  accept(visitor) {
    return visitor.visitBetweenPredicateExpression(this)
  }
}
