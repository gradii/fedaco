/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export declare function wrap(value: any[] | any): any[];
export declare function mapWithKeys(
    items: Record<string, any>,
    callback: (value: any, key: string) => Record<string, any>
): Record<string, any>;
