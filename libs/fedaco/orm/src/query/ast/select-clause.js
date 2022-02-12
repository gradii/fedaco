/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'
export class SelectClause extends SqlNode {
  constructor(selectExpressions = [], distinct = false) {
    super()
    this.selectExpressions = selectExpressions
    this.distinct = distinct
  }
  accept(sqlVisitor) {
    return sqlVisitor.visitSelectClause(this)
  }
}
