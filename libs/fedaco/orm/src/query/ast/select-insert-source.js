import { SqlNode } from '../sql-node'
export class SelectInsertSource extends SqlNode {
  constructor() {
    super()
  }
  accept(visitor) {
    return visitor.visitSelectInsertSource(this)
  }
}
