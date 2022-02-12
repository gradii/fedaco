/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'
export class OrderByClause extends SqlNode {
  constructor(elements) {
    super()
    this.elements = elements
  }
  accept(visitor) {
    return visitor.visitOrderByClause(this)
  }
}
