/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'
export class HavingClause extends SqlNode {
  constructor(expressions, conjunction = 'and') {
    super()
    this.expressions = expressions
    this.conjunction = conjunction
  }
  accept(visitor) {
    return visitor.visitHavingClause(this)
  }
}
