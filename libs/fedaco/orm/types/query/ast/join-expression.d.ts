/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { ConditionExpression } from './expression/condition-expression';
import { JoinOnExpression } from './join-on-expression';
import { Identifier } from './identifier';
import { JoinedTable } from './joined-table';
import { PathExpression } from './path-expression';
import { TableReferenceExpression } from './table-reference-expression';
export declare class JoinExpression extends SqlNode {
    type: string;
    name: TableReferenceExpression | PathExpression | Identifier | JoinedTable;
    on?: JoinOnExpression | ConditionExpression;
    constructor(
        type: string,
        name:
            | TableReferenceExpression
            | PathExpression
            | Identifier
            | JoinedTable,
        on?: JoinOnExpression | ConditionExpression
    );
    accept(visitor: SqlVisitor): string;
}
