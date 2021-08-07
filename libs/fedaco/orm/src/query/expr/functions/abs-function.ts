import { SqlVisitor } from '../../sql-visitor';
import { FunctionNode } from './function-node';


export class AbsFunction extends FunctionNode {
  constructor(
    public aggregateExpression
  ) {
    super();
  }

}