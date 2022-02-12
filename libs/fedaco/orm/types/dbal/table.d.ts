/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export declare class Table {
    tableName: string;
    columns: any[];
    indexes: any;
    foreignKeys: any[];
    constructor(
        tableName: string,
        columns: any[],
        indexes: any,
        foreignKeys: any[]
    );
    getColumns(): any[];
    getColumn(columnName: string): any;
}
