/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node'
export class NestedExpression extends SqlNode {
  constructor(type, expression, bindings = []) {
    super()
    this.type = type
    this.expression = expression
    this.bindings = bindings
  }
  accept(visitor) {
    return visitor.visitNestedExpression(this)
  }
}
