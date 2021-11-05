/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { Identifier } from './identifier';
export declare class JsonPathExpression extends SqlNode {
    paths: Identifier[];
    constructor(paths: Identifier[]);
    accept(visitor: SqlVisitor): string;
}
