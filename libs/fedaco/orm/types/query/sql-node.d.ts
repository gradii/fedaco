/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlVisitor } from './sql-visitor';
export declare abstract class SqlNode {
    __toString(): void;
    accept(visitor: SqlVisitor, ctx?: any): void;
    dump(obj: object): void;
}
