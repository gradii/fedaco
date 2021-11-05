/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { RawExpression } from './query/ast/expression/raw-expression';
import { Blueprint } from './schema/blueprint';
/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export declare abstract class BaseGrammar {
    protected tablePrefix: string;
    wrapArray(values: any[]): (string | number | boolean | void)[];
    wrapTable(table: RawExpression | Blueprint | string): string | number | boolean | void;
    wrap(value: RawExpression | string, prefixAlias?: boolean): string | number | boolean | void;
    protected wrapAliasedValue(value: string, prefixAlias?: boolean): string;
    protected wrapSegments(segments: any[]): string;
    protected wrapValue(value: string): string;
    protected wrapJsonSelector(value: string): void;
    protected isJsonSelector(value: string): boolean;
    columnize(columns: any[]): string;
    parameterize(values: any[]): string;
    parameter(value: any): string | number | boolean;
    quoteString(value: any[] | string): string;
    isExpression(value: any): boolean;
    getValue(expression: RawExpression): string | number | boolean;
    getDateFormat(): string;
    getTablePrefix(): string;
    setTablePrefix(prefix: string): this;
}
