/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { FromTable } from './from-table';
import { QuerySpecification } from './query-specification';
import { ValuesInsertSource } from './values-insert-source';
export declare class InsertSpecification extends SqlNode {
    insertOption: string;
    insertSource: ValuesInsertSource;
    columns: SqlNode[];
    target: QuerySpecification | FromTable;
    constructor(
        insertOption: string,
        insertSource: ValuesInsertSource,
        columns: SqlNode[],
        target: QuerySpecification | FromTable
    );
    accept(visitor: SqlVisitor): string;
}
