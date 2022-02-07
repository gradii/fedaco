/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlVisitor } from '../../sql-visitor';
import { Identifier } from '../identifier';
import { Expression } from './expression';
export declare class FunctionCallExpression extends Expression {
    name: Identifier;
    parameters: Expression[];
    constructor(name: Identifier, parameters: Expression[]);
    accept(visitor: SqlVisitor): string;
}
