/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Expression } from './expression'
export class FunctionCallExpression extends Expression {
  constructor(name, parameters) {
    super()
    this.name = name
    this.parameters = parameters
  }
  accept(visitor) {
    return visitor.visitFunctionCallExpression(this)
  }
}
