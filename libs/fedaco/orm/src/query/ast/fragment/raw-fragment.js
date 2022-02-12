/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node'
export class RawFragment extends SqlNode {
  constructor(value) {
    super()
    this.value = value
  }
  accept(visitor) {
    throw new Error('should not run')
  }
}
