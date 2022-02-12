import { SqlNode } from '../sql-node'
export class FromTable extends SqlNode {
  constructor(table, indexBy) {
    super()
    this.table = table
    this.indexBy = indexBy
  }
  accept(visitor) {
    if (!this._cached) {
      this._cached = visitor.visitFromTable(this)
    }
    return this._cached
  }
}
