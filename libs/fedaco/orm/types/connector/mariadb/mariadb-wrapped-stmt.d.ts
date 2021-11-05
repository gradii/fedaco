/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export declare class MariadbWrappedStmt {
    driverStmt: any;
    constructor(driverStmt: any);
    exec(bindings: any[]): void;
    close(): void;
}
