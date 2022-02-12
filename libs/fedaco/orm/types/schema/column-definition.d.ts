/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../query/sql-node';
export declare type PostgresColumnDefineAttributes = {
    deferrable?: boolean;
    initiallyImmediate?: boolean;
    isGeometry?: boolean;
    projection?: boolean;
};
export declare type ColumnDefineAttributes = {
    name?: string;
    after?: string;
    always?: boolean;
    algorithm?: string;
    allowed?: boolean;
    autoIncrement?: boolean;
    change?: boolean;
    charset?: string;
    columns?: string[];
    length?: number;
    collation?: string;
    comment?: string;
    default?: string;
    double?: boolean;
    total?: number;
    places?: number;
    first?: boolean;
    generatedAs?: string | SqlNode | boolean;
    index?: string;
    nullable?: boolean;
    persisted?: boolean;
    primary?: boolean;
    precision?: boolean;
    spatialIndex?: boolean;
    startingValue?: number;
    storedAs?: string;
    storedAsJson?: string;
    virtualAsJson?: string;
    type?: string;
    unique?: string;
    unsigned?: boolean;
    useCurrent?: boolean;
    useCurrentOnUpdate?: boolean;
    virtualAs?: string;
    from?: string;
    to?: string;
    expression?: string;
    srid?: number;
    [key: string]: any;
} & PostgresColumnDefineAttributes;
export declare class ColumnDefinition {
    attributes: ColumnDefineAttributes;
    constructor(attributes?: ColumnDefineAttributes);

    get(key: keyof ColumnDefineAttributes, defaultValue?: any): any;
    set(key: keyof ColumnDefineAttributes, val?: any): this;
    get name(): any;
    get after(): any;
    get always(): any;
    get algorithm(): any;
    get allowed(): any;
    get autoIncrement(): any;
    get change(): any;
    get charset(): any;
    get columns(): any;
    get length(): any;
    get collation(): any;
    get comment(): any;
    get default(): any;
    get double(): any;
    get total(): any;
    get places(): any;
    get first(): any;
    get generatedAs(): any;
    get index(): any;
    get nullable(): any;
    get persisted(): any;
    get primary(): any;
    get precision(): any;
    get spatialIndex(): any;
    get startingValue(): any;
    get storedAs(): any;
    get storedAsJson(): any;
    get virtualAsJson(): any;
    get type(): any;
    get unique(): any;
    get unsigned(): any;
    get useCurrent(): any;
    get useCurrentOnUpdate(): any;
    get virtualAs(): any;
    get from(): any;
    get to(): any;
    get expression(): any;
    get srid(): any;
    get deferrable(): any;
    get initiallyImmediate(): any;
    get notValid(): any;
    get isGeometry(): any;
    get projection(): any;

    getAttributes(): ColumnDefineAttributes;

    toArray(): ColumnDefineAttributes;

    toJson($options?: number): string;
    isset(attributeName: keyof ColumnDefineAttributes): boolean;
    unset(attributeName: keyof ColumnDefineAttributes): void;
    withName(val: string): this;

    withAfter(column: string): this;

    withAlways(): this;
    withAlgorithm(val: string): this;
    withAllowed(): this;

    withAutoIncrement(): this;

    withChange(): this;

    withCharset(charset: string): this;
    withColumns(columns: string[]): this;

    withLength(length: number): this;

    withCollation(collation: string): this;

    withComment(comment: string): this;

    withDefault(val: any): this;
    withDouble(val?: boolean): this;
    withTotal(val: number): this;
    withPlaces(val: any): this;

    withFirst(): this;

    withGeneratedAs(expression?: string | SqlNode | boolean): this;

    withIndex(indexName?: string): this;

    withNullable(val?: boolean): this;

    withPersisted(): this;

    withPrimary(): this;
    withPrecision(): this;

    withSpatialIndex(): this;

    withStartingValue(startingValue: number): this;

    withStoredAs(expression: string): this;
    withStoredAsJson(val: string): this;
    withVirtualAsJson(val: string): this;

    withType(type: string): this;

    withUnique(indexName?: string): this;

    withUnsigned(): this;

    withUseCurrent(): this;

    withUseCurrentOnUpdate(): this;

    withVirtualAs(expression: string): this;
    withFrom(val: string): this;
    withTo(to: string): this;
    withExpression(expression: string): this;
    withSrid(srid: number): this;
    withDeferrable(): this;
    withInitiallyImmediate(): this;
    withNotValid(): this;
    withIsGeometry(): this;
    withProjection(): this;
}
