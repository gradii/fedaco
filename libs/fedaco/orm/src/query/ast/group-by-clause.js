/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'
export class GroupByClause extends SqlNode {
  constructor(groups) {
    super()
    this.groups = groups
  }
  accept(visitor) {
    return visitor.visitGroupByClause(this)
  }
}
