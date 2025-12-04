/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { filterObj, isArray, isBlank, isObject, isString, isStringEmpty } from '@gradii/nanofn';
import type { ConnectionConfig } from '../database-config';

export class ConfigurationUrlParser {
  /* The drivers aliases map. */
  protected static driverAliases: any = {
    mssql     : 'sqlsrv',
    mysql2    : 'mysql',
    postgres  : 'pgsql',
    postgresql: 'pgsql',
    sqlite3   : 'sqlite',
    redis     : 'tcp',
    rediss    : 'tls',
  };

  /* Parse the database configuration, hydrating options using a database configuration URL if possible. */
  public parseConfiguration(config: ConnectionConfig | string) {
    if (isString(config)) {
      config = {
        url: config,
      };
    }
    const url = config['url'];
    delete config['url'];
    if (!url) {
      return config;
    }
    const rawComponents = this.parseUrl(url);
    const data = {
      hash        : rawComponents.hash,
      host        : rawComponents.host,
      hostname    : rawComponents.hostname,
      href        : rawComponents.href,
      origin      : rawComponents.origin,
      password    : rawComponents.password,
      pathname    : rawComponents.pathname,
      port        : rawComponents.port,
      protocol    : rawComponents.protocol,
      search      : rawComponents.search,
      // @ts-ignore
      searchParams: Object.fromEntries(rawComponents.searchParams),
      username    : rawComponents.username,
    };
    const decodedComponents = this.parseStringsToNativeTypes(data);
    return {
      ...config,
      ...this.getPrimaryOptions(decodedComponents),
      ...this.getQueryOptions(rawComponents),
    };
  }

  /* Get the primary database connection options. */
  protected getPrimaryOptions(url: any) {
    return filterObj(
      (value) => {
        return !isBlank(value);
      },
      {
        driver  : this.getDriver(url),
        database: this.getDatabase(url),
        host    : url['host'] ?? null,
        port    : !isStringEmpty(url['port']) ? +url['port'] : null,
        username: url['username'] ?? null,
        password: url['password'] ?? null,
      },
    );
  }

  /* Get the database driver from the URL. */
  protected getDriver(url: any) {
    const alias = url['protocol'].replace(/:$/, '') ?? null;
    if (!alias) {
      return;
    }
    return ConfigurationUrlParser.driverAliases[alias] ?? alias;
  }

  /* Get the database name from the URL. */
  protected getDatabase(url: any) {
    const path = url['pathname'] ?? null;
    return path && path !== '/' ? path.substring(1) : null;
  }

  /* Get all of the additional database options from the query string. */
  protected getQueryOptions(url: any) {
    const queryString = url['searchParams'] ?? null;
    if (!queryString) {
      return {};
    }
    // @ts-ignore
    const query = Object.fromEntries(new URLSearchParams(queryString));
    return this.parseStringsToNativeTypes(query);
  }

  /* Parse the string URL to an array of components. */
  protected parseUrl(url: string): URL {
    url = url.replace(/^(sqlite3?):\/\/\//, '$1://null/');
    try {
      return new URL(url);
    } catch (e) {
      throw new Error('InvalidArgumentException The database configuration URL is malformed.');
    }
  }

  /* Convert string casted values to their native types. */
  protected parseStringsToNativeTypes(value: Record<string, string | any>): Record<string, any> | any {
    if (isArray(value)) {
      return value.map((it) => this.parseStringsToNativeTypes(it));
    }
    if (isObject(value)) {
      for (const [key, val] of Object.entries(value)) {
        value[key] = this.parseStringsToNativeTypes(val) as any;
      }
    }
    if (!isString(value)) {
      return value;
    }
    try {
      return JSON.parse(value) as any[] | any;
    } catch (e) {
      return value;
    }
  }

  /* Get all of the current drivers' aliases. */
  public static getDriverAliases() {
    return ConfigurationUrlParser.driverAliases;
  }

  /* Add the given driver alias to the driver aliases array. */
  public static addDriverAlias(alias: string, driver: string) {
    ConfigurationUrlParser.driverAliases[alias] = driver;
  }
}
