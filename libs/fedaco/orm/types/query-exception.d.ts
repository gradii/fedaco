/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export declare class QueryException {
    protected sql: string;
    protected bindings: any[];
    message: string;
    constructor(sql: string, bindings: any[], message: string);
    protected formatMessage(
        sql: string,
        bindings: any[],
        message: string
    ): string;
    getSql(): string;
    getBindings(): any[];
    toString(): string;
}
