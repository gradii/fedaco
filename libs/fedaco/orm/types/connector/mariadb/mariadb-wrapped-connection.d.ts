/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { MariadbWrappedStmt } from './mariadb-wrapped-stmt';
export declare class MariadbWrappedConnection {
    driver: any;
    constructor(driver: any);
    prepare(sql: string): MariadbWrappedStmt;
}
