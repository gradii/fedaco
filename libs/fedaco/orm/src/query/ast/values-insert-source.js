/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'
export class ValuesInsertSource extends SqlNode {
  constructor(isDefault, valuesList = [], select) {
    super()
    this.isDefault = isDefault
    this.valuesList = valuesList
    this.select = select
  }
  accept(visitor) {
    return visitor.visitValuesInsertSource(this)
  }
}
