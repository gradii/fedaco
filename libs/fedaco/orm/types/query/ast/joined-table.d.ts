/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { JoinExpression } from './join-expression';
import { TableReferenceExpression } from './table-reference-expression';
/**
 */
export declare class JoinedTable extends SqlNode {
    from: TableReferenceExpression;
    joinExpressions: JoinExpression[];
    constructor(from: TableReferenceExpression, joinExpressions: JoinExpression[]);
    accept(sqlVisitor: SqlVisitor): string;
}
