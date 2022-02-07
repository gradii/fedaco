/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { JoinExpression } from './join-expression';
export declare class JoinClause extends SqlNode {
    joinExpression: JoinExpression;
    constructor(joinExpression: JoinExpression);
    accept(visitor: SqlVisitor): string;
}
