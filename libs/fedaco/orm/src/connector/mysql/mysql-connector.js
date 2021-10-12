import { __awaiter } from 'tslib';
import { createConnection } from 'mysql2';
import { Connector } from '../connector';
import { MysqlWrappedConnection } from './mysql-wrapped-connection';

export class MysqlConnector extends Connector {

  connect(config) {
    return __awaiter(this, void 0, void 0, function* () {
      const dsn = this.getDsn(config);
      const options = this.getOptions(config);
      const connection = yield this.createConnection(dsn, config, options);
      if (config['database'].length) {
        yield connection.exec(`use \`${config['database']}\`;`);
      }
      this.configureIsolationLevel(connection, config);
      this.configureEncoding(connection, config);
      yield this.configureTimezone(connection, config);
      this.setModes(connection, config);
      return connection;
    });
  }

  createConnection(database, config, options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      const [username, password] = [(_a = config['username']) !== null && _a !== void 0 ? _a : null, (_b = config['password']) !== null && _b !== void 0 ? _b : null];
      try {
        return Promise.resolve(new MysqlWrappedConnection(createConnection({
          host: config['host'],
          port: config['port'],
          user: username,
          password: password,
          database: config['database']
        })));
      } catch (e) {
        throw e;

      }
    });
  }

  configureIsolationLevel(connection, config) {
    if (!(config['isolation_level'] !== undefined)) {
      return;
    }
    connection.prepare(`SET SESSION TRANSACTION ISOLATION LEVEL ${config['isolation_level']}`).execute();
  }

  configureEncoding(connection, config) {
    if (!(config['charset'] !== undefined)) {
      return connection;
    }
    connection.prepare(`set names '${config['charset']}'${this.getCollation(config)}`).execute();
  }

  getCollation(config) {
    return config['collation'] !== undefined ? ` collate '${config['collation']}'` : '';
  }

  configureTimezone(connection, config) {
    return __awaiter(this, void 0, void 0, function* () {
      if (config['timezone'] !== undefined) {
        const stmt = yield connection.prepare(`set time_zone="${config['timezone']}"`);
        yield stmt.execute();
      }
    });
  }

  getDsn(config) {
    return this.hasSocket(config) ? this.getSocketDsn(config) : this.getHostDsn(config);
  }

  hasSocket(config) {
    return config['unix_socket'] !== undefined && config['unix_socket'].length;
  }

  getSocketDsn(config) {
    return `mysql:unix_socket=${config['unix_socket']};dbname=${config['database']}`;
  }

  getHostDsn(config) {
    return config.port !== undefined
      ? `mysql:host=${config.host};port=${config.port};dbname=${config.database}`
      : `mysql:host=${config.host};dbname=${config.database}"`;
  }

  setModes(connection, config) {
    if (config['modes'] !== undefined) {
      this.setCustomModes(connection, config);
    } else if (config['strict'] !== undefined) {
      if (config['strict']) {
        connection.prepare(this.strictMode(connection, config)).execute();
      } else {
        connection
          .prepare(`set session sql_mode='NO_ENGINE_SUBSTITUTION'`)
          .execute();
      }
    }
  }

  setCustomModes(connection, config) {
    const modes = config['modes'].join(',');
    connection.prepare(`set session sql_mode='${modes}'`).execute();
  }

  strictMode(connection, config) {
    const version = config['version'] || connection.getAttribute('PDO.ATTR_SERVER_VERSION');

    if (version >= '8.0.11') {
      return `set session sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'`;
    }
    return `set session sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'`;
  }
}
