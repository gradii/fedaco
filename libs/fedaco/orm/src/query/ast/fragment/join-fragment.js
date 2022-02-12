/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node'
export class JoinFragment extends SqlNode {
  constructor(joinQueryBuilder) {
    super()
    this.joinQueryBuilder = joinQueryBuilder
  }
  accept(visitor) {
    return visitor.visitJoinFragment(this)
  }
}
