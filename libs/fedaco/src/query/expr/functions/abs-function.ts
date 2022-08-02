/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Expression } from '../../ast/expression/expression';
import { FunctionNode } from './function-node';


export class AbsFunction extends FunctionNode {
  constructor(
    public aggregateExpression: Expression
  ) {
    super();
  }

}
