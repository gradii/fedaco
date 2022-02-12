/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'
export class AssignmentSetClause extends SqlNode {
  constructor(column, value) {
    super()
    this.column = column
    this.value = value
  }
  accept(visitor) {
    return visitor.visitAssignmentSetClause(this)
  }
}
