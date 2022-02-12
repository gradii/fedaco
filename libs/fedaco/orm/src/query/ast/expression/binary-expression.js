/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Expression } from './expression'
export class BinaryExpression extends Expression {
  constructor(left, operator, right) {
    super()
    this.left = left
    this.operator = operator
    this.right = right
  }
  accept(visitor) {
    return visitor.visitBinaryExpression(this)
  }
}
