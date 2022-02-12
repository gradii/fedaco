/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FunctionNode } from './function-node'
export class AbsFunction extends FunctionNode {
  constructor(aggregateExpression) {
    super()
    this.aggregateExpression = aggregateExpression
  }
}
