import { FunctionNode } from './function-node';

export class AbsFunction extends FunctionNode {
  constructor(aggregateExpression) {
    super();
    this.aggregateExpression = aggregateExpression;
  }
}
