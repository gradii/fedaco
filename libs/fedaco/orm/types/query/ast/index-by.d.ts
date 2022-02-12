/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';

export declare class IndexBy extends SqlNode {
    simpleStateFieldPathExpression: SqlNode;
    constructor(simpleStateFieldPathExpression?: SqlNode);
    accept(sqlVisitor: SqlVisitor): string;
}
