/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node'
export class NumberLiteralExpression extends SqlNode {
  constructor(value) {
    super()
    this.value = value
  }
  get text() {
    return this.value.toString()
  }
  accept(visitor) {
    return visitor.visitNumberLiteralExpression(this)
  }
}
