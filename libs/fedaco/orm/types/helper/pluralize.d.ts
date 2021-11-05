/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
/**
 * Pluralize a word
 * @param word word to pluralize
 * @return string of word pluralized
 */
export declare function plural(word: string): string;
export declare function pluralStudy(word: string): string;
/**
 * Check if a word is plural.
 * @param word word to check
 * @return boolean value if word is plural or not
 */
export declare function isPlural(word: string): boolean;
/**
 * Singularize a word
 * @param word word to singularize
 * @return string of word singularized
 */
export declare function singular(word: string): string;
/**
 * Check if a word is singular.
 * @param word word to check
 * @return boolean value if word is singular or not
 */
export declare function isSingular(word: string): boolean;
/**
 * Add a pluralization rule to the collection.
 *
 * @param rule rule to add
 * @param replacement replacement
 *
 */
export declare function addPluralRule(rule: string | RegExp, replacement: string): void;
/**
 * Add a singularization rule to the collection.
 *
 * @param rule rule to add
 * @param replacement replacement
 *
 */
export declare function addSingularRule(rule: string | RegExp, replacement: string): void;
/**
 * Add an uncountable word rule.
 *
 * @param word uncountable word
 *
 */
export declare function addUncountableRule(word: string | RegExp): void;
/**
 * Add an irregular word rule.
 *
 * @param single single name
 * @param plural plural name
 *
 */
export declare function addIrregularRule(single: string, plural: string): void;
