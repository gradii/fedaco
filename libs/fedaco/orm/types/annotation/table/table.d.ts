/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export interface TableAnnotation {
    tableName?: string;
    noPluralTable?: boolean;

    morphTypeName?: string;

    timestamped?: boolean;
    hidden?: string[];
    visible?: string[];
    connection?: string;

    created_at?: string;

    updated_at?: string;

    deleted_at?: string;
}
export interface InjectableDecorator<T extends TableAnnotation> {
    (options?: T): any;
    isTypeOf(obj: any): obj is T;
    metadataName: string;
    new (options?: T): T;
}
export declare const Table: InjectableDecorator<TableAnnotation>;
