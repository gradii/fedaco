/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'

export class JoinedTable extends SqlNode {
  constructor(from, joinExpressions) {
    super()
    this.from = from
    this.joinExpressions = joinExpressions
  }
  accept(sqlVisitor) {
    return sqlVisitor.visitJoinedTable(this)
  }
}
