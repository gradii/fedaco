/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Blueprint } from './blueprint';
import { ColumnDefinition } from './column-definition';
export declare class ForeignIdColumnDefinition extends ColumnDefinition {
    protected blueprint: Blueprint;
    constructor(blueprint: Blueprint, attributes?: any);
    withConstrained(
        table?: string | null,
        column?: string
    ): import('@gradii/fedaco').ForeignKeyDefinition;
    withReferences(
        column: string
    ): import('@gradii/fedaco').ForeignKeyDefinition;
}
