/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'
export class OrderByElement extends SqlNode {
  constructor(column, direction) {
    super()
    this.column = column
    this.direction = direction
  }
  accept(visitor, ctx) {
    return visitor.visitOrderByElement(this, ctx)
  }
}
