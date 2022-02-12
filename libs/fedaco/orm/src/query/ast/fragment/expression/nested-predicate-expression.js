import { Expression } from '../../expression/expression'
export class NestedPredicateExpression extends Expression {
  constructor(query) {
    super()
    this.query = query
    this.visited = false
  }
  accept(visitor) {
    if (this.visited) {
      throw new Error(
        'NestedPredicateExpression should have different sql node. same sql node found!'
      )
    }
    this.visited = true
    return visitor.visitNestedPredicateExpression(this)
  }
}
