/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Expression } from './expression'
export class ParenthesizedExpression extends Expression {
  constructor(expression) {
    super()
    this.expression = expression
  }
  accept(visitor) {
    return visitor.visitParenthesizedExpression(this)
  }
}
