const UPPERCASE_SUPPORTED_LOCALE = {
  tr: {
    regexp: /[\u0069]/g,
    map: {
      i: '\u0130'
    }
  },
  az: {
    regexp: /[\u0069]/g,
    map: {
      i: '\u0130'
    }
  },
  lt: {
    regexp: /[\u0069\u006A\u012F]\u0307|\u0069\u0307[\u0300\u0301\u0303]/g,
    map: {
      i̇: '\u0049',
      j̇: '\u004A',
      į̇: '\u012E',
      i̇̀: '\u00CC',
      i̇́: '\u00CD',
      i̇̃: '\u0128'
    }
  }
};

const LOWERCASE_SUPPORTED_LOCALE = {
  tr: {
    regexp: /\u0130|\u0049|\u0049\u0307/g,
    map: {
      İ: '\u0069',
      I: '\u0131',
      İ: '\u0069'
    }
  },
  az: {
    regexp: /\u0130/g,
    map: {
      İ: '\u0069',
      I: '\u0131',
      İ: '\u0069'
    }
  },
  lt: {
    regexp: /\u0049|\u004A|\u012E|\u00CC|\u00CD|\u0128/g,
    map: {
      I: '\u0069\u0307',
      J: '\u006A\u0307',
      Į: '\u012F\u0307',
      Ì: '\u0069\u0307\u0300',
      Í: '\u0069\u0307\u0301',
      Ĩ: '\u0069\u0307\u0303'
    }
  }
};

function replace(input, re, value) {
  if (re instanceof RegExp) {
    return input.replace(re, value);
  }

  return re.reduce((target, it) => target.replace(it, value), input);
}

export function camelCaseTransform(input, index) {
  if (index === 0) {
    return input.toLowerCase();
  }
  return pascalCaseTransform(input, index);
}

export function camelCaseTransformMerge(input, index) {
  if (index === 0) {
    return input.toLowerCase();
  }
  return pascalCaseTransformMerge(input);
}

export function camelCase(input, options = {}) {
  return pascalCase(input, Object.assign({ transform: camelCaseTransform }, options));
}

export function capitalCaseTransform(input) {
  return upperCaseFirst(input.toLowerCase());
}

export function capitalCase(input, options = {}) {
  return noCase(input, Object.assign({ delimiter: ' ', transform: capitalCaseTransform }, options));
}

export function constantCase(input, options = {}) {
  return noCase(input, Object.assign({ delimiter: '_', transform: upperCase }, options));
}

export function dotCase(input, options = {}) {
  return noCase(input, Object.assign({ delimiter: '.' }, options));
}

export function headerCase(input, options = {}) {
  return capitalCase(input, Object.assign({ delimiter: '-' }, options));
}

export function isLowerCase(input) {
  return input.toLowerCase() === input && input.toUpperCase() !== input;
}

export function isUpperCase(input) {
  return input.toUpperCase() === input && input.toLowerCase() !== input;
}

export function localeLowerCase(str, locale) {
  const lang = LOWERCASE_SUPPORTED_LOCALE[locale.toLowerCase()];
  if (lang) {
    return lowerCase(str.replace(lang.regexp, (m) => lang.map[m]));
  }
  return lowerCase(str);
}

export function lowerCase(str) {
  return str.toLowerCase();
}

export function lowerCaseFirst(input) {
  return input.charAt(0).toLowerCase() + input.substr(1);
}

const DEFAULT_SPLIT_REGEXP = [/([a-z0-9])([A-Z])/g, /([A-Z])([A-Z][a-z])/g];

const DEFAULT_STRIP_REGEXP = /[^A-Z0-9]+/gi;

export function noCase(input, options = {}) {
  const {
    splitRegexp = DEFAULT_SPLIT_REGEXP,
    stripRegexp = DEFAULT_STRIP_REGEXP,
    transform = lowerCase,
    delimiter = ' '
  } = options;
  const result = replace(replace(input, splitRegexp, '$1\0$2'), stripRegexp, '\0');
  let start = 0;
  let end = result.length;

  while (result.charAt(start) === '\0') {
    start++;
  }
  while (result.charAt(end - 1) === '\0') {
    end--;
  }

  return result.slice(start, end).split('\0').map(transform).join(delimiter);
}

export function paramCase(input, options = {}) {
  return dotCase(input, Object.assign({ delimiter: '-' }, options));
}

export function pascalCaseTransform(input, index) {
  const firstChar = input.charAt(0);
  const lowerChars = input.substr(1).toLowerCase();
  if (index > 0 && firstChar >= '0' && firstChar <= '9') {
    return `_${firstChar}${lowerChars}`;
  }
  return `${firstChar.toUpperCase()}${lowerChars}`;
}

export function pascalCaseTransformMerge(input) {
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

export function pascalCase(input, options = {}) {
  return noCase(input, Object.assign({ delimiter: '', transform: pascalCaseTransform }, options));
}

export function pathCase(input, options = {}) {
  return dotCase(input, Object.assign({ delimiter: '/' }, options));
}

export function sentenceCaseTransform(input, index) {
  const result = input.toLowerCase();
  if (index === 0) {
    return upperCaseFirst(result);
  }
  return result;
}

export function sentenceCase(input, options = {}) {
  return noCase(input, Object.assign({ delimiter: ' ', transform: sentenceCaseTransform }, options));
}

export function snakeCase(input, options = {}) {
  return dotCase(input, Object.assign({ delimiter: '_' }, options));
}

export function spongeCase(input) {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    result +=
      Math.random() > 0.5 ? input[i].toUpperCase() : input[i].toLowerCase();
  }
  return result;
}

export function swapCase(input) {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    const lower = input[i].toLowerCase();
    result += input[i] === lower ? input[i].toUpperCase() : lower;
  }
  return result;
}

const SMALL_WORDS = /\b(?:an?d?|a[st]|because|but|by|en|for|i[fn]|neither|nor|o[fnr]|only|over|per|so|some|tha[tn]|the|to|up|upon|vs?\.?|versus|via|when|with|without|yet)\b/i;
const TOKENS = /[^\s:–—-]+|./g;
const WHITESPACE = /\s/;
const IS_MANUAL_CASE = /.(?=[A-Z]|\..)/;
const ALPHANUMERIC_PATTERN = /[A-Za-z0-9\u00C0-\u00FF]/;

export function titleCase(input) {
  let result = '';
  let m;

  while ((m = TOKENS.exec(input)) !== null) {
    const { 0: token, index } = m;
    if (

      !IS_MANUAL_CASE.test(token) &&

      (!SMALL_WORDS.test(token) ||
        index === 0 ||
        index + token.length === input.length) &&

      (input.charAt(index + token.length) !== ':' ||
        WHITESPACE.test(input.charAt(index + token.length + 1)))) {

      result += token.replace(ALPHANUMERIC_PATTERN, (_m) => _m.toUpperCase());
      continue;
    }
    result += token;
  }
  return result;
}

export function localeUpperCase(str, locale) {
  const lang = UPPERCASE_SUPPORTED_LOCALE[locale.toLowerCase()];
  if (lang) {
    return upperCase(str.replace(lang.regexp, (m) => lang.map[m]));
  }
  return upperCase(str);
}

export function upperCase(str) {
  return str.toUpperCase();
}

export function upperCaseFirst(input) {
  return input.charAt(0).toUpperCase() + input.substr(1);
}

export function replaceArray(subject, search, replaces) {
  var _a;
  const segments = subject.split(search);
  let result = segments.shift();
  for (const segment of segments) {
    result += ((_a = replaces.shift()) !== null && _a !== void 0 ? _a : search) + segment;
  }
  return result;
}
