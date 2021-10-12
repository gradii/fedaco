import { __awaiter } from 'tslib';
import { has } from '@gradii/check-type';
import { Connection } from '../connection';
import { MysqlConnection } from '../connection/mysql-connection';
import { PostgresConnection } from '../connection/postgres-connection';
import { SqlServerConnection } from '../connection/sql-server-connection';
import { SqliteConnection } from '../connection/sqlite-connection';
import { wrap } from '../helper/arr';
import { MysqlConnector } from './mysql/mysql-connector';
import { SqliteConnector } from './sqlite/sqlite-connector';

export class ConnectionFactory {


  make(config, name = null) {
    config = this.parseConfig(config, name);
    if (config['read'] !== undefined) {
      return this.createReadWriteConnection(config);
    }
    return this.createSingleConnection(config);
  }

  parseConfig(config, name) {
    if (!has(config, 'prefix')) {
      config.prefix = '';
    }
    if (!has(config, 'name')) {
      config.name = name;
    }
    return config;
  }

  createSingleConnection(config) {
    const pdo = this.createPdoResolver(config);
    return this.createConnection(config['driver'], pdo, config['database'], config['prefix'], config);
  }

  createReadWriteConnection(config) {
    const connection = this.createSingleConnection(this.getWriteConfig(config));
    return connection.setReadPdo(this.createReadPdo(config));
  }

  createReadPdo(config) {
    return this.createPdoResolver(this.getReadConfig(config));
  }

  getReadConfig(config) {
    return this.mergeReadWriteConfig(config, this.getReadWriteConfig(config, 'read'));
  }

  getWriteConfig(config) {
    return this.mergeReadWriteConfig(config, this.getReadWriteConfig(config, 'write'));
  }

  getReadWriteConfig(config, type) {
    return config[type][0] !== undefined ? config[type][Math.floor(Math.random() * config[type].length)] : config[type];
  }

  mergeReadWriteConfig(config, merge) {
    return [...config, ...merge].filter(it => !['read', 'write'].includes(it));
  }

  createPdoResolver(config) {
    return 'host' in config ? this.createPdoResolverWithHosts(config) : this.createPdoResolverWithoutHosts(config);
  }

  createPdoResolverWithHosts(config) {
    return () => {
      const hosts = this.parseHosts(config).sort(() => .5 - Math.random());
      for (const [key, host] of Object.entries(hosts)) {
        config['host'] = host;
        try {
          return this.createConnector(config).connect(config);
        } catch (e) {
          continue;
        }
      }
      throw new Error('connect fail');
    };
  }

  parseHosts(config) {
    const hosts = wrap(config['host']);
    if (!hosts.length) {
      throw new Error('InvalidArgumentException Database hosts array is empty.');
    }
    return hosts;
  }

  createPdoResolverWithoutHosts(config) {
    return () => __awaiter(this, void 0, void 0, function* () {
      return this.createConnector(config).connect(config);
    });
  }

  createConnector(config) {
    if (!(config['driver'] !== undefined)) {
      throw new Error('InvalidArgumentException A driver must be specified.');
    }


    switch (config['driver']) {
      case 'mysql':
        return new MysqlConnector();


      case 'sqlite':
        return new SqliteConnector();


    }
    throw new Error(`InvalidArgumentException Unsupported driver [${config['driver']}].`);
  }

  createConnection(driver, connection, database, prefix = '', config = []) {
    const resolver = Connection.getResolver(driver);
    if (resolver) {
      return resolver(connection, database, prefix, config);
    }
    switch (driver) {
      case 'mysql':
        return new MysqlConnection(connection, database, prefix, config);
      case 'pgsql':
        return new PostgresConnection(connection, database, prefix, config);
      case 'sqlite':
        return new SqliteConnection(connection, database, prefix, config);
      case 'sqlsrv':
        return new SqlServerConnection(connection, database, prefix, config);
    }
    throw new Error('InvalidArgumentException "Unsupported driver [{$driver}]."');
  }
}
