/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'
export class BindingVariable extends SqlNode {
  constructor(bindingExpression, type = 'where') {
    super()
    this.bindingExpression = bindingExpression
    this.type = type
  }
  accept(visitor) {
    return visitor.visitBindingVariable(this)
  }
}
