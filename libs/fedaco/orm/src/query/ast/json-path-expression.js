import { SqlNode } from '../sql-node'

export class JsonPathExpression extends SqlNode {
  constructor(pathExpression, pathLeg, jsonLiteral) {
    super()
    this.pathExpression = pathExpression
    this.pathLeg = pathLeg
    this.jsonLiteral = jsonLiteral
  }
  accept(visitor) {
    return visitor.visitJsonPathExpression(this)
  }
}
