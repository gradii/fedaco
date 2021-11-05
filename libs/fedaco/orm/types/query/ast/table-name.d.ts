/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { Identifier } from './identifier';
export declare class TableName extends SqlNode {
    identifiers: Identifier[];
    get serverIdentifier(): Identifier;
    get databaseIdentifier(): Identifier;
    get schemaIdentifier(): Identifier;
    get baseIdentifier(): Identifier;
    constructor(identifiers: Identifier[]);
    protected ChooseIdentifier(modifier: number): Identifier;
    accept(visitor: SqlVisitor): string;
}
