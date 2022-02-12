/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'
export class SelectInsertSource extends SqlNode {
  constructor() {
    super()
  }
  accept(visitor) {
    return visitor.visitSelectInsertSource(this)
  }
}
