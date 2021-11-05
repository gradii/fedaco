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
    /**
     * Set the foreign key as deferrable (PostgreSQL)
     */
    withDeferrable(value?: boolean): this;
    /**
     * Set the default time to check the constraint (PostgreSQL)
     */
    withInitiallyImmediate(value?: boolean): this;
    /**
     * Specify the referenced table
     */
    withOn(table: string): this;
    /**
     * Add an ON DELETE action
     */
    withOnDelete(action: string): this;
    /**
     * Add an ON UPDATE action
     */
    withOnUpdate(action: string): this;
    /**
     * Specify the referenced column(s)
     */
    withReferences(columns: string | string[]): this;
    withCascadeOnUpdate(): this;
    withCascadeOnDelete(): this;
    withRestrictOnDelete(): this;
    withNullOnDelete(): this;
}
