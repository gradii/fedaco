/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Expression } from '../../ast/expression/expression';
import { FunctionNode } from './function-node';
export declare class AbsFunction extends FunctionNode {
    aggregateExpression: Expression;
    constructor(aggregateExpression: Expression);
}
