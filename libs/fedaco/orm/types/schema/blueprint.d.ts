/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from '../connection';
import { Model } from '../fedaco/model';
import { ColumnDefinition } from './column-definition';
import { ForeignIdColumnDefinition } from './foreign-id-column-definition';
import { ForeignKeyDefinition } from './foreign-key-definition';
import { SchemaGrammar } from './grammar/schema-grammar';
export declare class Blueprint {
    protected table: string;
    protected prefix: string;
    protected columns: ColumnDefinition[];
    protected commands: any[];
    engine: string;
    charset: string;
    collation: string;
    _temporary: boolean;
    _after: string;
    constructor(table: string, callback?: Function | null, prefix?: string);
    build(connection: Connection, grammar: SchemaGrammar): Promise<void>;
    toSql(connection: Connection, grammar: SchemaGrammar): string[];
    protected ensureCommandsAreValid(connection: Connection): void;
    protected commandsNamed(names: any): any[];
    protected addImpliedCommands(grammar: SchemaGrammar): void;
    protected addFluentIndexes(): void;
    addFluentCommands(grammar: SchemaGrammar): void;
    creating(): any;
    create(): ColumnDefinition;
    temporary(): void;
    drop(): ColumnDefinition;
    dropIfExists(): ColumnDefinition;
    dropColumn(columns: any[] | any, ...args: any[]): ColumnDefinition;
    renameColumn(from: string, to: string): ColumnDefinition;
    dropPrimary(index?: string | any[] | null): ColumnDefinition;
    dropUnique(index: string | any[]): ColumnDefinition;
    dropIndex(index: string | any[]): ColumnDefinition;
    dropSpatialIndex(index: string | any[]): ColumnDefinition;
    dropForeign(index: string | any[]): ColumnDefinition;
    dropConstrainedForeignId(column: string): ColumnDefinition;
    renameIndex(from: string, to: string): ColumnDefinition;
    dropTimestamps(): void;
    dropTimestampsTz(): void;
    dropSoftDeletes(column?: string): void;
    dropSoftDeletesTz(column?: string): void;
    dropRememberToken(): void;
    dropMorphs(name: string, indexName?: string | null): void;
    rename(to: string): ColumnDefinition;
    primary(
        columns: any[] | string,
        name?: string | null,
        algorithm?: string | null
    ): ColumnDefinition;
    unique(
        columns: any[] | string,
        name?: string | null,
        algorithm?: string | null
    ): ColumnDefinition;
    index(
        columns: any[] | string,
        name?: string | null,
        algorithm?: string | null
    ): ColumnDefinition;
    spatialIndex(
        columns: any[] | string,
        name?: string | null
    ): ColumnDefinition;
    rawIndex(expression: string, name: string): ColumnDefinition;
    foreign(
        columns: any[] | string,
        name?: string | null
    ): ForeignKeyDefinition;
    id(column?: string): ColumnDefinition;
    increments(column: string): ColumnDefinition;
    integerIncrements(column: string): ColumnDefinition;
    tinyIncrements(column: string): ColumnDefinition;
    smallIncrements(column: string): ColumnDefinition;
    mediumIncrements(column: string): ColumnDefinition;
    bigIncrements(column: string): ColumnDefinition;
    char(column: string, length?: number | null): ColumnDefinition;
    string(column: string, length?: number | null): ColumnDefinition;
    tinyText(column: string): ColumnDefinition;
    text(column: string): ColumnDefinition;
    mediumText(column: string): ColumnDefinition;
    longText(column: string): ColumnDefinition;
    integer(
        column: string,
        autoIncrement?: boolean,
        unsigned?: boolean
    ): ColumnDefinition;
    tinyInteger(
        column: string,
        autoIncrement?: boolean,
        unsigned?: boolean
    ): ColumnDefinition;
    smallInteger(
        column: string,
        autoIncrement?: boolean,
        unsigned?: boolean
    ): ColumnDefinition;
    mediumInteger(
        column: string,
        autoIncrement?: boolean,
        unsigned?: boolean
    ): ColumnDefinition;
    bigInteger(
        column: string,
        autoIncrement?: boolean,
        unsigned?: boolean
    ): ColumnDefinition;
    unsignedInteger(column: string, autoIncrement?: boolean): ColumnDefinition;
    unsignedTinyInteger(
        column: string,
        autoIncrement?: boolean
    ): ColumnDefinition;
    unsignedSmallInteger(
        column: string,
        autoIncrement?: boolean
    ): ColumnDefinition;
    unsignedMediumInteger(
        column: string,
        autoIncrement?: boolean
    ): ColumnDefinition;
    unsignedBigInteger(
        column: string,
        autoIncrement?: boolean
    ): ColumnDefinition;
    foreignId(column: string): ForeignIdColumnDefinition;
    foreignIdFor(
        model: Model,
        column?: string | null
    ): ForeignIdColumnDefinition;
    float(
        column: string,
        total?: number,
        places?: number,
        unsigned?: boolean
    ): ColumnDefinition;
    double(
        column: string,
        total?: number | null,
        places?: number | null,
        unsigned?: boolean
    ): ColumnDefinition;
    decimal(
        column: string,
        total?: number,
        places?: number,
        unsigned?: boolean
    ): ColumnDefinition;
    unsignedFloat(
        column: string,
        total?: number,
        places?: number
    ): ColumnDefinition;
    unsignedDouble(
        column: string,
        total?: number,
        places?: number
    ): ColumnDefinition;
    unsignedDecimal(
        column: string,
        total?: number,
        places?: number
    ): ColumnDefinition;
    boolean(column: string): ColumnDefinition;
    enum(column: string, allowed: any[]): ColumnDefinition;
    set(column: string, allowed: any[]): ColumnDefinition;
    json(column: string): ColumnDefinition;
    jsonb(column: string): ColumnDefinition;
    date(column: string): ColumnDefinition;
    dateTime(column: string, precision?: number): ColumnDefinition;
    dateTimeTz(column: string, precision?: number): ColumnDefinition;
    time(column: string, precision?: number): ColumnDefinition;
    timeTz(column: string, precision?: number): ColumnDefinition;
    timestamp(column: string, precision?: number): ColumnDefinition;
    timestampTz(column: string, precision?: number): ColumnDefinition;
    timestamps(precision?: number): void;
    nullableTimestamps(precision?: number): void;
    timestampsTz(precision?: number): void;
    softDeletes(column?: string, precision?: number): ColumnDefinition;
    softDeletesTz(column?: string, precision?: number): ColumnDefinition;
    year(column: string): ColumnDefinition;
    binary(column: string): ColumnDefinition;
    uuid(column?: string): ColumnDefinition;
    foreignUuid(column: string): ForeignIdColumnDefinition;
    ipAddress(column?: string): ColumnDefinition;
    macAddress(column?: string): ColumnDefinition;
    geometry(column: string): ColumnDefinition;
    point(column: string, srid?: number | null): ColumnDefinition;
    lineString(column: string): ColumnDefinition;
    polygon(column: string): ColumnDefinition;
    geometryCollection(column: string): ColumnDefinition;
    multiPoint(column: string): ColumnDefinition;
    multiLineString(column: string): ColumnDefinition;
    multiPolygon(column: string): ColumnDefinition;
    multiPolygonZ(column: string): ColumnDefinition;
    computed(column: string, expression: string): ColumnDefinition;
    morphs(name: string, indexName?: string | null): void;
    nullableMorphs(name: string, indexName?: string | null): void;
    numericMorphs(name: string, indexName?: string | null): void;
    nullableNumericMorphs(name: string, indexName?: string | null): void;
    uuidMorphs(name: string, indexName?: string | null): void;
    nullableUuidMorphs(name: string, indexName?: string | null): void;
    rememberToken(): ColumnDefinition;
    protected indexCommand(
        type: string,
        columns: any[] | any,
        index: string,
        algorithm?: string | null
    ): ColumnDefinition;
    protected dropIndexCommand(
        command: string,
        type: string,
        index: string | any[]
    ): ColumnDefinition;
    protected createIndexName(type: string, columns: any[]): string;
    addColumn(
        type:
            | 'ipAddress'
            | 'macAddress'
            | 'geometry'
            | 'point'
            | 'lineString'
            | 'polygon'
            | 'geometryCollection'
            | 'multiPoint'
            | 'multiLineString'
            | 'multiPolygon'
            | 'multiPolygonZ'
            | 'computed'
            | string,
        name: string,
        parameters?: Record<string, any>
    ): ColumnDefinition;
    protected addColumnDefinition<
        T extends ColumnDefinition = ColumnDefinition
    >(definition: T): T;
    after(column: string, callback: Function): void;
    removeColumn(name: string): this;
    protected addCommand(name: string, parameters?: any): ColumnDefinition;
    protected createCommand(name: string, parameters?: any): ColumnDefinition;
    getTable(): string;
    getColumns(): ColumnDefinition[];
    getCommands(): any[];
    getAddedColumns(): ColumnDefinition[];
    getChangedColumns(): ColumnDefinition[];
    hasAutoIncrementColumn(): boolean;
    autoIncrementingStartingValues(): any[];
}
