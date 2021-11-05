/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export declare const Boot: {
    (...args: any[]): any;
    (...args: any[]): (cls: any) => any;
    new (...args: any[]): any;
    isTypeOf: (obj: any) => obj is unknown;
    metadataName: string;
};
