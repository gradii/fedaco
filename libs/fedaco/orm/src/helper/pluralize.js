/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import {
  defaultIrregularPlurals,
  defaultIrregularSingles,
  defaultPluralRules,
  defaultSingularRules,
  defaultUncountables,
} from './_pluralize-values'
import { noCase } from './str'
const pluralRules = defaultPluralRules
const singularRules = defaultSingularRules
const uncountables = defaultUncountables
const irregularPlurals = defaultIrregularPlurals
const irregularSingles = defaultIrregularSingles

export function plural(word) {
  const validate = replaceWord(irregularSingles, irregularPlurals, pluralRules)
  return validate(word)
}
export function pluralStudy(word) {
  return noCase(word, {
    transform: (part, index, target) => {
      if (target.length - 1 === index) {
        return plural(part)
      }
      return part
    },
    delimiter: '_',
  })
}

export function isPlural(word) {
  const validate = checkWord(irregularSingles, irregularPlurals, pluralRules)
  return validate(word)
}

export function singular(word) {
  const validate = replaceWord(
    irregularPlurals,
    irregularSingles,
    singularRules
  )
  return validate(word)
}

export function isSingular(word) {
  const validate = checkWord(irregularPlurals, irregularSingles, singularRules)
  return validate(word)
}

export function addPluralRule(rule, replacement) {
  pluralRules.push([sanitizeRule(rule), replacement])
}

export function addSingularRule(rule, replacement) {
  singularRules.push([sanitizeRule(rule), replacement])
}

export function addUncountableRule(word) {
  if (typeof word === 'string') {
    uncountables[word.toLowerCase()] = true
    return
  }

  addPluralRule(word, '$0')
  addSingularRule(word, '$0')
}

export function addIrregularRule(single, plural) {
  plural = plural.toLowerCase()
  single = single.toLowerCase()
  irregularSingles[single] = plural
  irregularPlurals[plural] = single
}

function sanitizeRule(rule) {
  if (typeof rule === 'string') {
    return new RegExp('^' + rule + '$', 'i')
  }
  return rule
}

function restoreCase(word, token) {
  if (word === token) {
    return token
  }

  if (word === word.toLowerCase()) {
    return token.toLowerCase()
  }

  if (word === word.toUpperCase()) {
    return token.toUpperCase()
  }

  if (word[0] === word[0].toUpperCase()) {
    return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase()
  }

  return token.toLowerCase()
}

function interpolate(str, args) {
  return str.replace(/\$(\d{1,2})/g, function (match, index) {
    return args[index] || ''
  })
}

function replace(word, rule) {
  return word.replace(rule[0], function (match, index) {
    const result = interpolate(rule[1], arguments)
    if (match === '') {
      return restoreCase(word[index - 1], result)
    }
    return restoreCase(match, result)
  })
}

function sanitizeWord(token, word, rules) {
  if (!token.length || uncountables.hasOwnProperty(token)) {
    return word
  }
  let len = rules.length

  while (len--) {
    const rule = rules[len]
    if (rule[0].test(word)) {
      return replace(word, rule)
    }
  }
  return word
}

function replaceWord(replaceMap, keepMap, rules) {
  return (word) => {
    const token = word.toLowerCase()

    if (keepMap.hasOwnProperty(token)) {
      return restoreCase(word, token)
    }

    if (replaceMap.hasOwnProperty(token)) {
      return restoreCase(word, replaceMap[token])
    }

    return sanitizeWord(token, word, rules)
  }
}

function checkWord(replaceMap, keepMap, rules, bool) {
  return (word) => {
    const token = word.toLowerCase()
    if (keepMap.hasOwnProperty(token)) {
      return true
    }
    if (replaceMap.hasOwnProperty(token)) {
      return false
    }
    return sanitizeWord(token, token, rules) === token
  }
}
