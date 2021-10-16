import { SqlNode } from '../sql-node'
export class InsertSpecification extends SqlNode {
  constructor(insertOption, insertSource, columns, target) {
    super()
    this.insertOption = insertOption
    this.insertSource = insertSource
    this.columns = columns
    this.target = target
  }
  accept(visitor) {
    return visitor.visitInsertSpecification(this)
  }
}
