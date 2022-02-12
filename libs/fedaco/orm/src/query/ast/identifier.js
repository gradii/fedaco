/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'
export class Identifier extends SqlNode {
  constructor(name) {
    super()
    this.name = name
  }
  accept(visitor) {
    return visitor.visitIdentifier(this)
  }
}
