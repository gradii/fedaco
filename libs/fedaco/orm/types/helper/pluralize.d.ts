/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export declare function plural(word: string): string;
export declare function pluralStudy(word: string): string;

export declare function isPlural(word: string): boolean;

export declare function singular(word: string): string;

export declare function isSingular(word: string): boolean;

export declare function addPluralRule(
    rule: string | RegExp,
    replacement: string
): void;

export declare function addSingularRule(
    rule: string | RegExp,
    replacement: string
): void;

export declare function addUncountableRule(word: string | RegExp): void;

export declare function addIrregularRule(single: string, plural: string): void;
