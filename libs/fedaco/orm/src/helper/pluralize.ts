import {
  defaultIrregularPlurals,
  defaultIrregularSingles,
  defaultPluralRules,
  defaultSingularRules,
  defaultUncountables
} from './_pluralize-values';
import { noCase } from './str';


const pluralRules: any[]    = defaultPluralRules;
const singularRules: any[]  = defaultSingularRules;
const uncountables: any     = defaultUncountables;
const irregularPlurals: any = defaultIrregularPlurals;
const irregularSingles: any = defaultIrregularSingles;

/**
 * Pluralize a word
 * @param word word to pluralize
 * @return string of word pluralized
 */
export function plural(word: string): string {
  const validate = replaceWord(irregularSingles, irregularPlurals,
    pluralRules);
  return validate(word);
}

export function pluralStudy(word: string): string {
  return noCase(word, {
    transform: (part, index, target) => {
      if (target.length - 1 === index) {
        return plural(part);
      }
      return part;
    },
    delimiter: ''
  });
}

/**
 * Check if a word is plural.
 * @param word word to check
 * @return boolean value if word is plural or not
 */
export function isPlural(word: string): boolean {
  const validate = checkWord(irregularSingles, irregularPlurals,
    pluralRules);
  return validate(word);
}

/**
 * Singularize a word
 * @param word word to singularize
 * @return string of word singularized
 */
export function singular(word: string): string {
  const validate = replaceWord(irregularPlurals, irregularSingles,
    singularRules);
  return validate(word);
}

/**
 * Check if a word is singular.
 * @param word word to check
 * @return boolean value if word is singular or not
 */
export function isSingular(word: string): boolean {
  const validate = checkWord(irregularPlurals, irregularSingles,
    singularRules);
  return validate(word);
}

/**
 * Add a pluralization rule to the collection.
 *
 * @param rule rule to add
 * @param replacement replacement
 *
 */
export function addPluralRule(rule: string | RegExp, replacement: string): void {
  pluralRules.push([sanitizeRule(rule), replacement]);
}


/**
 * Add a singularization rule to the collection.
 *
 * @param rule rule to add
 * @param replacement replacement
 *
 */
export function addSingularRule(rule: string | RegExp, replacement: string): void {
  singularRules.push([sanitizeRule(rule), replacement]);
}

/**
 * Add an uncountable word rule.
 *
 * @param word uncountable word
 *
 */
export function addUncountableRule(word: string | RegExp): void {
  if (typeof word === 'string') {
    uncountables[word.toLowerCase()] = true;
    return;
  }

  // Set singular and plural references for the word.
  addPluralRule(word, '$0');
  addSingularRule(word, '$0');
}


/**
 * Add an irregular word rule.
 *
 * @param single single name
 * @param plural plural name
 *
 */
export function addIrregularRule(single: string, plural: string): void {
  plural = plural.toLowerCase();
  single = single.toLowerCase();

  irregularSingles[single] = plural;
  irregularPlurals[plural] = single;
}


/**
 * Sanitize a pluralization rule to a usable regular expression.
 *
 * @param rule rule to transform
 * @return sanitized rule
 */
function sanitizeRule(rule: string | RegExp) {
  if (typeof rule === 'string') {
    return new RegExp('^' + rule + '$', 'i');
  }
  return rule;
}

/**
 * Pass in a word token to produce a function that can replicate the case on
 * another word.
 *
 * @param word word to generate
 * @param token token to generate
 * @return Function to implement
 */
function restoreCase(word: string, token: string) {
  // Tokens are an exact match.
  if (word === token) {
    return token;
  }

  // Lower cased words. E.g. "hello".
  if (word === word.toLowerCase()) {
    return token.toLowerCase();
  }

  // Upper cased words. E.g. "WHISKY".
  if (word === word.toUpperCase()) {
    return token.toUpperCase();
  }

  // Title cased words. E.g. "Title".
  if (word[0] === word[0].toUpperCase()) {
    return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
  }

  // Lower cased words. E.g. "test".
  return token.toLowerCase();
}


/**
 * Interpolate a regexp string.
 *
 * @param str string to generate
 * @param args args to generate
 * @return a string
 */
function interpolate(str: string, args: IArguments) {
  return str.replace(/\$(\d{1,2})/g, (match, index) => {
    return args[index] || '';
  });
}

/**
 * Replace a word using a rule.
 *
 * @param word word to format
 * @param rule word to use in format
 * @return string
 */
function replace(word: string, rule: any[]) {
  return word.replace(rule[0], (match, index) => {
    const result = interpolate(rule[1], arguments);
    if (match === '') {
      return restoreCase(word[index - 1], result);
    }

    return restoreCase(match, result);
  });
}

/**
 * Sanitize a word by passing in the word and sanitization rules.
 *
 * @param token
 * @param word
 * @param rules
 * @return string
 */
function sanitizeWord(token: string, word: string, rules: any[]) {
  // Empty string or doesn't need fixing.
  if (!token.length || uncountables.hasOwnProperty(token)) {
    return word;
  }

  let len = rules.length;

  // Iterate over the sanitization rules and use the first one to match.
  while (len--) {
    const rule = rules[len];

    if (rule[0].test(word)) {
      return replace(word, rule);
    }
  }

  return word;
}

/**
 * Replace a word with the updated word.
 *
 * @param replaceMap object
 * @param keepMap object
 * @param rules array
 * @return Function
 */
function replaceWord(replaceMap: any, keepMap: any, rules: any) {
  return (word: string) => {
    // Get the correct token and case restoration functions.
    const token: string = word.toLowerCase();

    // Check against the keep object map.
    if (keepMap.hasOwnProperty(token)) {
      return restoreCase(word, token);
    }

    // Check against the replacement map for a direct word replacement.
    if (replaceMap.hasOwnProperty(token)) {
      return restoreCase(word, replaceMap[token]);
    }

    // Run all the rules against the word.
    return sanitizeWord(token, word, rules);
  };
}

/**
 * Check if a word is part of the map.
 * @param replaceMap object
 * @param keepMap object
 * @param rules array
 * @param bool boolean value
 * @return Function
 */
function checkWord(replaceMap: any, keepMap: any, rules: any, bool?: boolean) {
  return (word: string) => {
    const token = word.toLowerCase();

    if (keepMap.hasOwnProperty(token)) {
      return true;
    }
    if (replaceMap.hasOwnProperty(token)) {
      return false;
    }
    return sanitizeWord(token, token, rules) === token;
  };
}

