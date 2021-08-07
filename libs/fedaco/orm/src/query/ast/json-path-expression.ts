import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { Identifier } from './identifier';

//MultiPartIdentifier
export class JsonPathExpression extends SqlNode {

  constructor(public paths: Identifier[],) {
    super();
  }

  public accept(visitor: SqlVisitor) {
    return visitor.visitJsonPathExpression(this);
  }
}