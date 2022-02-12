/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { FromTable } from './from-table';
import { JoinedTable } from './joined-table';

export declare class FromClause extends SqlNode {
    from: FromTable;
    joins: JoinedTable[];
    constructor(from: FromTable, joins?: JoinedTable[]);
    accept(sqlVisitor: SqlVisitor): string;
}
