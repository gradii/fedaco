/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
import { Identifier } from '../identifier';
export declare class AggregateFragment extends SqlNode {
    aggregateFunctionName: Identifier;
    aggregateColumns: SqlNode[];
    constructor(aggregateFunctionName: Identifier, aggregateColumns: SqlNode[]);
    accept(visitor: SqlVisitor): string;
}
