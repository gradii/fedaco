/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SchemaGrammar } from '../schema/grammar/schema-grammar';
export declare class Column {
    protected _name: any;
    protected _type: any;
    protected _length: number | null;
    protected _precision: number;
    protected _scale: number;
    protected _unsigned: boolean;
    protected _fixed: boolean;
    protected _notnull: boolean;
    protected _default: string | null;
    protected _autoincrement: boolean;
    protected _platformOptions: Record<string, any>;
    protected _columnDefinition: string | null;
    protected _comment: string | null;
    protected _customSchemaOptions: any;
    constructor(columnName: string, type: any, options?: any);
    setName(name: string): this;
    setOptions(options: any[]): this;
    setType(type: any): this;
    setLength(length: number | null): this;
    setPrecision(precision: number): this;
    setScale(scale: number): this;
    setUnsigned(unsigned: boolean): this;
    setFixed(fixed: boolean): this;
    setNotnull(notnull: boolean): this;
    setDefault(_default: any): this;
    setPlatformOptions(platformOptions: any[]): this;
    setPlatformOption(name: string, value: any): this;
    setColumnDefinition(value: string): this;
    getType(): any;
    getLength(): number;
    getPrecision(): number;
    getScale(): number;
    getUnsigned(): boolean;
    getFixed(): boolean;
    getNotnull(): boolean;
    getDefault(): string;
    getPlatformOptions(): Record<string, any>;
    hasPlatformOption(name: string): boolean;
    getPlatformOption(name: string): any;
    getColumnDefinition(): string;
    getAutoincrement(): boolean;
    setAutoincrement(flag: boolean): this;
    setComment(comment: string | null): this;
    getComment(): string;
    setCustomSchemaOption(name: string, value: any): this;
    hasCustomSchemaOption(name: string): boolean;
    getCustomSchemaOption(name: string): any;
    setCustomSchemaOptions(customSchemaOptions: any[]): this;
    getCustomSchemaOptions(): any;
    getQuotedName(grammar: SchemaGrammar): string;
    toArray(): any;
}
