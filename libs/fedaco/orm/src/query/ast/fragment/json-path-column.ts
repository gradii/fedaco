import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
import { JsonPathExpression } from '../json-path-expression';
import { PathExpression } from '../path-expression';


export class JsonPathColumn extends SqlNode {
  constructor(
    public columns: PathExpression,
    public jsonPaths: JsonPathExpression
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitJsonPathColumn(this)
  }
}