/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
/**
 * @license (c) -2020 blakeembrey
 * @license (c) 2020-2021 gradii
 */
export interface Options {
    splitRegexp?: RegExp | RegExp[];
    stripRegexp?: RegExp | RegExp[];
    delimiter?: string;
    transform?: (part: string, index: number, parts: string[]) => string;
}
export declare function camelCaseTransform(input: string, index: number): string;
export declare function camelCaseTransformMerge(input: string, index: number): string;
export declare function camelCase(input: string, options?: Options): string;
export declare function capitalCaseTransform(input: string): string;
export declare function capitalCase(input: string, options?: Options): string;
export declare function constantCase(input: string, options?: Options): string;
export declare function dotCase(input: string, options?: Options): string;
export declare function headerCase(input: string, options?: Options): string;
export declare function isLowerCase(input: string): boolean;
export declare function isUpperCase(input: string): boolean;
/**
 * Localized lower case.
 */
export declare function localeLowerCase(str: string, locale: string): string;
/**
 * Lower case as a function.
 */
export declare function lowerCase(str: string): string;
export declare function lowerCaseFirst(input: string): string;
/**
 * Normalize the string into something other libraries can manipulate easier.
 */
export declare function noCase(input: string, options?: Options): string;
export declare function paramCase(input: string, options?: Options): string;
export declare function pascalCaseTransform(input: string, index: number): string;
export declare function pascalCaseTransformMerge(input: string): string;
export declare function pascalCase(input: string, options?: Options): string;
export declare function pathCase(input: string, options?: Options): string;
export declare function sentenceCaseTransform(input: string, index: number): string;
export declare function sentenceCase(input: string, options?: Options): string;
export declare function snakeCase(input: string, options?: Options): string;
export declare function spongeCase(input: string): string;
export declare function swapCase(input: string): string;
export declare function titleCase(input: string): string;
/**
 * Localized upper case.
 */
export declare function localeUpperCase(str: string, locale: string): string;
/**
 * Upper case as a function.
 */
export declare function upperCase(str: string): string;
/**
 * Upper case the first character of an input string.
 */
export declare function upperCaseFirst(input: string): string;
export declare function replaceArray(subject: string, search: string, replaces: string[]): string;
