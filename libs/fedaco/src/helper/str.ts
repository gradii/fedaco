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

interface Locale {
  regexp: RegExp;
  map: Record<string, string>;
}


const UPPERCASE_SUPPORTED_LOCALE: Record<string, Locale> = {
  tr: {
    regexp: /[\u0069]/g,
    map   : {
      i: '\u0130',
    },
  },
  az: {
    regexp: /[\u0069]/g,
    map   : {
      i: '\u0130',
    },
  },
  lt: {
    regexp: /[\u0069\u006A\u012F]\u0307|\u0069\u0307[\u0300\u0301\u0303]/g,
    map   : {
      i̇ : '\u0049',
      j̇ : '\u004A',
      į̇ : '\u012E',
      i̇̀: '\u00CC',
      i̇́: '\u00CD',
      i̇̃: '\u0128',
    },
  },
};


/**
 * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
 */
const LOWERCASE_SUPPORTED_LOCALE: Record<string, Locale> = {
  tr: {
    regexp: /\u0130|\u0049|\u0049\u0307/g,
    map   : {
      İ : '\u0069',
      I : '\u0131',
      İ: '\u0069'
    }
  },
  az: {
    regexp: /\u0130/g,
    map   : {
      İ : '\u0069',
      I : '\u0131',
      İ: '\u0069'
    }
  },
  lt: {
    regexp: /\u0049|\u004A|\u012E|\u00CC|\u00CD|\u0128/g,
    map   : {
      I: '\u0069\u0307',
      J: '\u006A\u0307',
      Į: '\u012F\u0307',
      Ì: '\u0069\u0307\u0300',
      Í: '\u0069\u0307\u0301',
      Ĩ: '\u0069\u0307\u0303'
    }
  }
};

/**
 * Replace `re` in the input string with the replacement value.
 */
function replace(input: string, re: RegExp | RegExp[], value: string) {
  if (re instanceof RegExp) {
    return input.replace(re, value);
  }
  // @ts-ignore
  return (re as RegExp[]).reduce((target, it) => target.replace(it, value), input);
}

export function camelCaseTransform(input: string, index: number) {
  if (index === 0) {
    return input.toLowerCase();
  }
  return pascalCaseTransform(input, index);
}

export function camelCaseTransformMerge(input: string, index: number) {
  if (index === 0) {
    return input.toLowerCase();
  }
  return pascalCaseTransformMerge(input);
}

export function camelCase(input: string, options: Options = {}) {
  return pascalCase(input, {
    transform: camelCaseTransform,
    ...options
  });
}

export function capitalCaseTransform(input: string) {
  return upperCaseFirst(input.toLowerCase());
}

export function capitalCase(input: string, options: Options = {}) {
  return noCase(input, {
    delimiter: ' ',
    transform: capitalCaseTransform,
    ...options
  });
}

export function constantCase(input: string, options: Options = {}) {
  return noCase(input, {
    delimiter: '_',
    transform: upperCase,
    ...options
  });
}

export function dotCase(input: string, options: Options = {}) {
  return noCase(input, {
    delimiter: '.',
    ...options
  });
}

export function headerCase(input: string, options: Options = {}) {
  return capitalCase(input, {
    delimiter: '-',
    ...options
  });
}

export function slugCase(input: string, options: Options = {}) {
  return dotCase(input, {
    delimiter: '-',
    ...options
  });
}

export function isLowerCase(input: string) {
  return input.toLowerCase() === input && input.toUpperCase() !== input;
}

export function isUpperCase(input: string) {
  return input.toUpperCase() === input && input.toLowerCase() !== input;
}

/**
 * Localized lower case.
 */
export function localeLowerCase(str: string, locale: string) {
  const lang = LOWERCASE_SUPPORTED_LOCALE[locale.toLowerCase()];
  if (lang) {
    return lowerCase(str.replace(lang.regexp, (m) => lang.map[m]));
  }
  return lowerCase(str);
}

/**
 * Lower case as a function.
 */
export function lowerCase(str: string) {
  return str.toLowerCase();
}

export function lowerCaseFirst(input: string) {
  return input.charAt(0).toLowerCase() + input.substr(1);
}

// Support camel case ("camelCase" -> "camel Case" and "CAMELCase" -> "CAMEL Case").
const DEFAULT_SPLIT_REGEXP = [/([a-z0-9])([A-Z])/g, /([A-Z])([A-Z][a-z])/g];

// Remove all non-word characters.
const DEFAULT_STRIP_REGEXP = /[^A-Z0-9]+/gi;

/**
 * Normalize the string into something other libraries can manipulate easier.
 */
export function noCase(input: string, options: Options = {}) {
  const {
          splitRegexp = DEFAULT_SPLIT_REGEXP,
          stripRegexp = DEFAULT_STRIP_REGEXP,
          transform   = lowerCase,
          delimiter   = ' '
        } = options;

  const result = replace(
    replace(input, splitRegexp, '$1\0$2'),
    stripRegexp,
    '\0'
  );
  let start    = 0;
  let end      = result.length;

  // Trim the delimiter from around the output string.
  while (result.charAt(start) === '\0') {
    start++;
  }
  while (result.charAt(end - 1) === '\0') {
    end--;
  }

  // Transform each token independently.
  return result.slice(start, end).split('\0').map(transform).join(delimiter);
}


export function paramCase(input: string, options: Options = {}) {
  return dotCase(input, {
    delimiter: '-',
    ...options
  });
}

export function pascalCaseTransform(input: string, index: number) {
  const firstChar  = input.charAt(0);
  const lowerChars = input.substr(1).toLowerCase();
  if (index > 0 && firstChar >= '0' && firstChar <= '9') {
    return `_${firstChar}${lowerChars}`;
  }
  return `${firstChar.toUpperCase()}${lowerChars}`;
}

export function pascalCaseTransformMerge(input: string) {
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

export function pascalCase(input: string, options: Options = {}) {
  return noCase(input, {
    delimiter: '',
    transform: pascalCaseTransform,
    ...options
  });
}

export function pathCase(input: string, options: Options = {}) {
  return dotCase(input, {
    delimiter: '/',
    ...options
  });
}

export function sentenceCaseTransform(input: string, index: number) {
  const result = input.toLowerCase();
  if (index === 0) {
    return upperCaseFirst(result);
  }
  return result;
}

export function sentenceCase(input: string, options: Options = {}) {
  return noCase(input, {
    delimiter: ' ',
    transform: sentenceCaseTransform,
    ...options
  });
}

export function snakeCase(input: string, options: Options = {}) {
  return dotCase(input, {
    delimiter: '_',
    ...options
  });
}

export function spongeCase(input: string): string {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    result +=
      Math.random() > 0.5 ? input[i].toUpperCase() : input[i].toLowerCase();
  }
  return result;
}

export function swapCase(input: string) {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    const lower = input[i].toLowerCase();
    result += input[i] === lower ? input[i].toUpperCase() : lower;
  }
  return result;
}


const SMALL_WORDS          = /\b(?:an?d?|a[st]|because|but|by|en|for|i[fn]|neither|nor|o[fnr]|only|over|per|so|some|tha[tn]|the|to|up|upon|vs?\.?|versus|via|when|with|without|yet)\b/i;
const TOKENS               = /[^\s:–—-]+|./g;
const WHITESPACE           = /\s/;
const IS_MANUAL_CASE       = /.(?=[A-Z]|\..)/;
const ALPHANUMERIC_PATTERN = /[A-Za-z0-9\u00C0-\u00FF]/;

export function titleCase(input: string) {
  let result = '';
  let m: RegExpExecArray | null;

  // tslint:disable-next-line
  while ((m = TOKENS.exec(input)) !== null) {
    const {0: token, index} = m;

    if (
      // Ignore already capitalized words.
      !IS_MANUAL_CASE.test(token) &&
      // Ignore small words except at beginning or end.
      (!SMALL_WORDS.test(token) ||
        index === 0 ||
        index + token.length === input.length) &&
      // Ignore URLs.
      (input.charAt(index + token.length) !== ':' ||
        WHITESPACE.test(input.charAt(index + token.length + 1)))
    ) {
      // Find and uppercase first word character, skips over *modifiers*.
      result += token.replace(ALPHANUMERIC_PATTERN, (_m) => _m.toUpperCase());
      continue;
    }

    result += token;
  }

  return result;
}

/**
 * Localized upper case.
 */
export function localeUpperCase(str: string, locale: string) {
  const lang = UPPERCASE_SUPPORTED_LOCALE[locale.toLowerCase()];
  if (lang) {
    return upperCase(str.replace(lang.regexp, (m) => lang.map[m]));
  }
  return upperCase(str);
}

/**
 * Upper case as a function.
 */
export function upperCase(str: string) {
  return str.toUpperCase();
}

/**
 * Upper case the first character of an input string.
 */
export function upperCaseFirst(input: string) {
  return input.charAt(0).toUpperCase() + input.substr(1);
}

export function replaceArray(subject: string, search: string, replaces: string[]) {
  const segments = subject.split(search);
  let result     = segments.shift();
  for (const segment of segments) {
    result += (replaces.shift() ?? search) + segment;
  }
  return result;
}
