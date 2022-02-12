/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { IndexBy } from './index-by';
import { RangeVariableDeclaration } from './range-variable-declaration';

export declare class IdentifyVariableDeclaration extends SqlNode {
    rangeVariableDeclaration: RangeVariableDeclaration;
    indexBy?: IndexBy;
    joins: any[];
    constructor(
        rangeVariableDeclaration: RangeVariableDeclaration,
        indexBy?: IndexBy,
        joins?: any[]
    );
    accept(sqlVisitor: SqlVisitor): string;
}
