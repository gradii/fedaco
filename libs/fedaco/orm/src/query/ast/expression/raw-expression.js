/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node'
export class RawExpression extends SqlNode {
  constructor(value) {
    super()
    this.value = value
  }
  accept(visitor) {
    return visitor.visitRawExpression(this)
  }
}
