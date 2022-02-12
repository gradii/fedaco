/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'

export class NodePart extends SqlNode {
  constructor(part, references, declarations) {
    super()
    this.part = part
    this.references = references
    this.declarations = declarations
  }
  accept(visitor) {
    return visitor.visitNodePart(this)
  }
}
