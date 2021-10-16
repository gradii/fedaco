import { SqlNode } from '../sql-node'
export class FromTable extends SqlNode {
  constructor(table, indexBy) {
    super()
    this.table = table
    this.indexBy = indexBy
  }
  accept(visitor) {
    return visitor.visitFromTable(this)
  }
}
