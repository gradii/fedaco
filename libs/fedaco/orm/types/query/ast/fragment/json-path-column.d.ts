/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
import { JsonPathExpression } from '../json-path-expression';
import { PathExpression } from '../path-expression';

export declare class JsonPathColumn extends SqlNode {
    columns: PathExpression;
    jsonPaths: JsonPathExpression;
    constructor(columns: PathExpression, jsonPaths: JsonPathExpression);
    accept(visitor: SqlVisitor): string;
}
