/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
/**
 * FromClause ::= "FROM" IdentificationVariableDeclaration {"," IdentificationVariableDeclaration}
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { FromTable } from './from-table';
import { JoinedTable } from './joined-table';
/**
 * array of identifyVariableDeclarations is a alia for cross join
 */
export declare class FromClause extends SqlNode {
    from: FromTable;
    joins: JoinedTable[];
    constructor(from: FromTable, joins?: JoinedTable[]);
    accept(sqlVisitor: SqlVisitor): string;
}
