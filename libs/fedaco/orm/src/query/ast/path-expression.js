/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node'

export class PathExpression extends SqlNode {
  constructor(identifiers) {
    super()
    this.identifiers = identifiers
  }
  get serverIdentifier() {
    return this.ChooseIdentifier(5)
  }
  get databaseIdentifier() {
    return this.ChooseIdentifier(4)
  }
  get schemaIdentifier() {
    return this.ChooseIdentifier(3)
  }
  get tableIdentifier() {
    return this.ChooseIdentifier(2)
  }
  get columnIdentifier() {
    return this.ChooseIdentifier(1)
  }
  ChooseIdentifier(modifier) {
    const index = this.identifiers.length - modifier
    return index < 0 ? undefined : this.identifiers[index]
  }
  accept(visitor) {
    return visitor.visitPathExpression(this)
  }
}
