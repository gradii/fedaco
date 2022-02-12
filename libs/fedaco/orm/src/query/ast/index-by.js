/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'

export class IndexBy extends SqlNode {
  constructor(simpleStateFieldPathExpression = null) {
    super()
    this.simpleStateFieldPathExpression = simpleStateFieldPathExpression
  }
  accept(sqlVisitor) {
    return sqlVisitor.visitIndexBy(this)
  }
}
