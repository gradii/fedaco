/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { RawExpression } from './expression/raw-expression';
import { IndexBy } from './index-by';
import { TableReferenceExpression } from './table-reference-expression';
export declare class FromTable extends SqlNode {
    table: TableReferenceExpression | RawExpression;
    indexBy?: IndexBy;
    protected _cached: string;
    constructor(table: TableReferenceExpression | RawExpression, indexBy?: IndexBy);
    accept(visitor: SqlVisitor): string;
}
