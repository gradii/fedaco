/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import {
  isArray,
  isBlank,
  isObject,
  isString,
  isStringEmpty,
} from '@gradii/check-type'
import { filter } from 'ramda'
export class ConfigurationUrlParser {
  parseConfiguration(config) {
    if (isString(config)) {
      config = {
        url: config,
      }
    }
    const url = config['url']
    delete config['url']
    if (!url) {
      return config
    }
    const rawComponents = this.parseUrl(url)
    const data = {
      hash: rawComponents.hash,
      host: rawComponents.host,
      hostname: rawComponents.hostname,
      href: rawComponents.href,
      origin: rawComponents.origin,
      password: rawComponents.password,
      pathname: rawComponents.pathname,
      port: rawComponents.port,
      protocol: rawComponents.protocol,
      search: rawComponents.search,

      searchParams: Object.fromEntries(rawComponents.searchParams),
      username: rawComponents.username,
    }
    const decodedComponents = this.parseStringsToNativeTypes(data)
    return Object.assign(
      Object.assign(
        Object.assign({}, config),
        this.getPrimaryOptions(decodedComponents)
      ),
      this.getQueryOptions(rawComponents)
    )
  }

  getPrimaryOptions(url) {
    var _a, _b, _c
    return filter(
      (value) => {
        return !isBlank(value)
      },
      {
        driver: this.getDriver(url),
        database: this.getDatabase(url),
        host: (_a = url['host']) !== null && _a !== void 0 ? _a : null,
        port: !isStringEmpty(url['port']) ? +url['port'] : null,
        username: (_b = url['username']) !== null && _b !== void 0 ? _b : null,
        password: (_c = url['password']) !== null && _c !== void 0 ? _c : null,
      }
    )
  }

  getDriver(url) {
    var _a, _b
    const alias =
      (_a = url['protocol'].replace(/:$/, '')) !== null && _a !== void 0
        ? _a
        : null
    if (!alias) {
      return
    }
    return (_b = ConfigurationUrlParser.driverAliases[alias]) !== null &&
      _b !== void 0
      ? _b
      : alias
  }

  getDatabase(url) {
    var _a
    const path = (_a = url['pathname']) !== null && _a !== void 0 ? _a : null
    return path && path !== '/' ? path.substring(1) : null
  }

  getQueryOptions(url) {
    var _a
    const queryString =
      (_a = url['searchParams']) !== null && _a !== void 0 ? _a : null
    if (!queryString) {
      return {}
    }

    const query = Object.fromEntries(new URLSearchParams(queryString))
    return this.parseStringsToNativeTypes(query)
  }

  parseUrl(url) {
    url = url.replace(/^(sqlite3?):\/\/\//, '$1://null/')
    try {
      return new URL(url)
    } catch (e) {
      throw new Error(
        'InvalidArgumentException The database configuration URL is malformed.'
      )
    }
  }

  parseStringsToNativeTypes(value) {
    if (isArray(value)) {
      return value.map((it) => this.parseStringsToNativeTypes(it))
    }
    if (isObject(value)) {
      for (const [key, val] of Object.entries(value)) {
        value[key] = this.parseStringsToNativeTypes(val)
      }
    }
    if (!isString(value)) {
      return value
    }
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }

  static getDriverAliases() {
    return ConfigurationUrlParser.driverAliases
  }

  static addDriverAlias(alias, driver) {
    ConfigurationUrlParser.driverAliases[alias] = driver
  }
}

ConfigurationUrlParser.driverAliases = {
  mssql: 'sqlsrv',
  mysql2: 'mysql',
  postgres: 'pgsql',
  postgresql: 'pgsql',
  sqlite3: 'sqlite',
  redis: 'tcp',
  rediss: 'tls',
}
