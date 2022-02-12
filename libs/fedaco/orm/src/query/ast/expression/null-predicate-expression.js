/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node'
export class NullPredicateExpression extends SqlNode {
  constructor(expression, not = false) {
    super()
    this.expression = expression
    this.not = not
  }
  accept(visitor) {
    return visitor.visitNullPredicateExpression(this)
  }
}
