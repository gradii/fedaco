/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export interface TableAnnotation {
    /**
     * the database table name
     */
    tableName?: string;
    noPluralTable?: boolean;
    /**
     * the morph type name is used for morphOne morphMany.
     * this value is stored in morphTo table's morphType column
     */
    morphTypeName?: string;
    /**
     * Indicates if the model should be timestamped.
     */
    timestamped?: boolean;
    hidden?: string[];
    visible?: string[];
    connection?: string;
    /**
     * specify the created_at column when timestamped.
     * default is created_at
     */
    created_at?: string;
    /**
     * specify the updated_at column when timestamped.
     * default is updated_at
     */
    updated_at?: string;
    /**
     * specify the deleted_at column when use soft delete.
     * default is deleted_at
     */
    deleted_at?: string;
}
export interface InjectableDecorator<T extends TableAnnotation> {
    (options?: T): any;
    isTypeOf(obj: any): obj is T;
    metadataName: string;
    new (options?: T): T;
}
export declare const Table: InjectableDecorator<TableAnnotation>;
