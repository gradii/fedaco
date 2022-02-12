/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export declare type ForwardRefFn<T = any> = () => T;
export declare function forwardRef(
    forwardRefFn: ForwardRefFn
): ForwardRefFn<any>;
export declare function resolveForwardRef<T>(
    type: ForwardRefFn<T> | T | undefined
): T;
export declare function isForwardRef(fn: any): fn is () => any;
