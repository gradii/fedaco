/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ColumnDefineAttributes, ColumnDefinition } from './column-definition';
export declare type ForeignKeyDefinitionAttributes = {
    deferrable: boolean;
    initiallyImmediate: boolean;
    on: string;
    onDelete: string;
    onUpdate: string;
    references: string | string[];
};
export declare class ForeignKeyDefinition extends ColumnDefinition {
    attributes: ColumnDefineAttributes & ForeignKeyDefinitionAttributes;
    get deferrable(): any;
    get initiallyImmediate(): any;
    get on(): any;
    get onDelete(): any;
    get onUpdate(): any;
    get references(): any;

    withDeferrable(value?: boolean): this;

    withInitiallyImmediate(value?: boolean): this;

    withOn(table: string): this;

    withOnDelete(action: string): this;

    withOnUpdate(action: string): this;

    withReferences(columns: string | string[]): this;
    withCascadeOnUpdate(): this;
    withCascadeOnDelete(): this;
    withRestrictOnDelete(): this;
    withNullOnDelete(): this;
}
