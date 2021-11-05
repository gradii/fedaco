/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
/**
 * IndexBy ::= "INDEX" "BY" SimpleStateFieldPathExpression
 */
export declare class IndexBy extends SqlNode {
    simpleStateFieldPathExpression: any;
    constructor(simpleStateFieldPathExpression?: any);
    accept(sqlVisitor: any): any;
}
