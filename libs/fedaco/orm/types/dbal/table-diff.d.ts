/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Table } from './table';
export declare class TableDiff {
    tableName: string;
    addedColumns?: any[];
    changedColumns?: any[];
    removedColumns?: any[];
    addedIndexes?: any[];
    changedIndexes?: any[];
    removedIndexes?: any[];
    fromTable?: Table;
    constructor(
        tableName: string,
        addedColumns?: any[],
        changedColumns?: any[],
        removedColumns?: any[],
        addedIndexes?: any[],
        changedIndexes?: any[],
        removedIndexes?: any[],
        fromTable?: Table
    );
}
