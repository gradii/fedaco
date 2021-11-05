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
    /**
     * Get an attribute from the fluent instance.
     */
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
    /**
     * Get the attributes from the fluent instance.
     */
    getAttributes(): ColumnDefineAttributes;
    /**
     * Convert the fluent instance to an array.
     */
    toArray(): ColumnDefineAttributes;
    /**
     * Convert the fluent instance to JSON.
     */
    toJson($options?: number): string;
    isset(attributeName: keyof ColumnDefineAttributes): boolean;
    unset(attributeName: keyof ColumnDefineAttributes): void;
    withName(val: string): this;
    /**
     * Place the column "after" another column (MySQL)
     * @param string
     */
    withAfter(column: string): this;
    /**
     * Used as a modifier for generatedAs() (PostgreSQL)
     */
    withAlways(): this;
    withAlgorithm(val: string): this;
    withAllowed(): this;
    /**
     * Set INTEGER columns as auto-increment (primary key)
     */
    withAutoIncrement(): this;
    /**
     * Change the column
     */
    withChange(): this;
    /**
     * Specify a character set for the column (MySQL)
     */
    withCharset(charset: string): this;
    withColumns(columns: string[]): this;
    /**
     * Specify a length for char int etc
     */
    withLength(length: number): this;
    /**
     * Specify a collation for the column (MySQL/PostgreSQL/SQL Server)
     */
    withCollation(collation: string): this;
    /**
     * Add a comment to the column (MySQL/PostgreSQL)
     * @param string
     */
    withComment(comment: string): this;
    /**
     * Specify a "default" value for the column
     */
    withDefault(val: any): this;
    withDouble(val?: boolean): this;
    withTotal(val: number): this;
    withPlaces(val: any): this;
    /**
     * Place the column "first" in the table (MySQL)
     */
    withFirst(): this;
    /**
     * Create a SQL compliant identity column (PostgreSQL)
     * @param string|SqlNode
     */
    withGeneratedAs(expression?: string | SqlNode | boolean): this;
    /**
     * Add an index
     */
    withIndex(indexName?: string): this;
    /**
     * Allow NULL values to be inserted into the column
     */
    withNullable(val?: boolean): this;
    /**
     * Mark the computed generated column as persistent (SQL Server)
     */
    withPersisted(): this;
    /**
     * Add a primary index
     */
    withPrimary(): this;
    withPrecision(): this;
    /**
     * Add a spatial index
     */
    withSpatialIndex(): this;
    /**
     * Set the starting value of an auto-incrementing field (MySQL/PostgreSQL)
     */
    withStartingValue(startingValue: number): this;
    /**
     * Create a stored generated column (MySQL/PostgreSQL/SQLite)
     */
    withStoredAs(expression: string): this;
    withStoredAsJson(val: string): this;
    withVirtualAsJson(val: string): this;
    /**
     * Specify a type for the column
     */
    withType(type: string): this;
    /**
     * Add a unique index
     */
    withUnique(indexName?: string): this;
    /**
     * Set the INTEGER column as UNSIGNED (MySQL)
     */
    withUnsigned(): this;
    /**
     * Set the TIMESTAMP column to use CURRENT_TIMESTAMP as default value
     */
    withUseCurrent(): this;
    /**
     * Set the TIMESTAMP column to use CURRENT_TIMESTAMP when updating (MySQL)
     */
    withUseCurrentOnUpdate(): this;
    /**
     * Create a virtual generated column (MySQL/PostgreSQL/SQLite)
     */
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
