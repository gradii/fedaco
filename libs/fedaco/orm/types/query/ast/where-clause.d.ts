/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { ConditionExpression } from './expression/condition-expression';
export declare class WhereClause extends SqlNode {
    conditionExpression: ConditionExpression;
    constructor(conditionExpression: ConditionExpression);
    accept(visitor: SqlVisitor): string;
}
