/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
export declare class BindingVariable extends SqlNode {
    bindingExpression: SqlNode;
    type: string;
    constructor(bindingExpression: SqlNode, type?: string);
    accept(visitor: SqlVisitor): string;
}
