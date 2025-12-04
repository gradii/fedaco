/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isPresent } from '@gradii/nanofn';
// import { Arr } from "Illuminate/Support/Arr";
// import { PDO } from "PDO";
import { Connector } from '../connector';
import type { ConnectorInterface } from '../connector-interface';
import type { WrappedConnection } from '../wrapped-connection';
import { SqlServerWrappedConnection } from './sql-server-wrapped-connection';

export class SqlServerConnector extends Connector implements ConnectorInterface {
  /* The PDO connection options. */
  protected options: any = {};

  /* Establish a database connection. */
  public async connect(config: any[]): Promise<WrappedConnection> {
    const options = this.getOptions(config);
    const connection = await this.createConnection(this.getDsn(config), config, options);

    await this.configureIsolationLevel(connection, config);

    return connection;
  }

  public async createConnection(database: string, config: any, options: any) {
    const [username, password] = [config['username'] ?? null, config['password'] ?? null];
    // try {
    const { Connection } = await import('tedious');
    const connection = new Connection({
      ...config,
      server        : config['host'],
      authentication: {
        type   : 'default',
        options: {
          userName: username,
          password: password,
        },
        ...(config.authentication || {}),
      },
      options: {
        ...(config.options || {}),
        port    : config['port'],
        database: config['database'],
      },
    });
    await new Promise<void>((ok, fail) => {
      connection.connect((err) => {
        if (err) {
          fail(err);
        } else {
          ok();
        }
      });
    });
    return new SqlServerWrappedConnection(connection);
  }

  protected async configureIsolationLevel(connection: WrappedConnection, config: any) {
    if (!isPresent(config['isolation_level'])) {
      return;
    }

    await (await connection.prepare(`SET TRANSACTION ISOLATION LEVEL ${config['isolation_level']}`)).execute();
  }

  /* Create a DSN string from a configuration. */
  protected getDsn(config: any) {
    return `${config.host}`;
    // if (this.prefersOdbc(config)) {
    //   return this.getOdbcDsn(config);
    // }
    // if (in_array('sqlsrv', this.getAvailableDrivers())) {
    //   return this.getSqlSrvDsn(config);
    // } else {
    //   return this.getDblibDsn(config);
    // }
  }

  //
  // /*Determine if the database configuration prefers ODBC.*/
  // protected prefersOdbc(config: any[]) {
  //   return in_array('odbc', this.getAvailableDrivers()) && (config['odbc'] ?? null) === true;
  // }
  //
  // /*Get the DSN string for a DbLib connection.*/
  // protected getDblibDsn(config: any[]) {
  //   return this.buildConnectString('dblib', [
  //     ...{
  //       'host'  : this.buildHostString(config, ':'),
  //       'dbname': config['database']
  //     }, ...Arr.only(config, ['appname', 'charset', 'version'])
  //   ]);
  // }
  //
  // /*Get the DSN string for an ODBC connection.*/
  // protected getOdbcDsn(config: any[]) {
  //   return config['odbc_datasource_name'] !== undefined ? 'odbc:' + config['odbc_datasource_name'] : '';
  // }
  //
  // /*Get the DSN string for a SqlSrv connection.*/
  // protected getSqlSrvDsn(config: any) {
  //   const arguments = {
  //     'Server': this.buildHostString(config, ',')
  //   };
  //   if (config['database'] !== undefined) {
  //     arguments['Database'] = config['database'];
  //   }
  //   if (config['readonly'] !== undefined) {
  //     arguments['ApplicationIntent'] = 'ReadOnly';
  //   }
  //   if (config['pooling'] !== undefined && config['pooling'] === false) {
  //     arguments['ConnectionPooling'] = '0';
  //   }
  //   if (config['appname'] !== undefined) {
  //     arguments['APP'] = config['appname'];
  //   }
  //   if (config['encrypt'] !== undefined) {
  //     arguments['Encrypt'] = config['encrypt'];
  //   }
  //   if (config['trust_server_certificate'] !== undefined) {
  //     arguments['TrustServerCertificate'] = config['trust_server_certificate'];
  //   }
  //   if (config['multiple_active_result_sets'] !== undefined && config['multiple_active_result_sets'] === false) {
  //     arguments['MultipleActiveResultSets'] = 'false';
  //   }
  //   if (config['transaction_isolation'] !== undefined) {
  //     arguments['TransactionIsolation'] = config['transaction_isolation'];
  //   }
  //   if (config['multi_subnet_failover'] !== undefined) {
  //     arguments['MultiSubnetFailover'] = config['multi_subnet_failover'];
  //   }
  //   if (config['column_encryption'] !== undefined) {
  //     arguments['ColumnEncryption'] = config['column_encryption'];
  //   }
  //   if (config['key_store_authentication'] !== undefined) {
  //     arguments['KeyStoreAuthentication'] = config['key_store_authentication'];
  //   }
  //   if (config['key_store_principal_id'] !== undefined) {
  //     arguments['KeyStorePrincipalId'] = config['key_store_principal_id'];
  //   }
  //   if (config['key_store_secret'] !== undefined) {
  //     arguments['KeyStoreSecret'] = config['key_store_secret'];
  //   }
  //   if (config['login_timeout'] !== undefined) {
  //     arguments['LoginTimeout'] = config['login_timeout'];
  //   }
  //   return this.buildConnectString('sqlsrv', arguments);
  // }
  //
  // /*Build a connection string from the given arguments.*/
  // protected buildConnectString(driver: string, arguments: any[]) {
  //   return driver + ':' + array_map(key => {
  //     return `${key}=${arguments[key]}`;
  //   }, array_keys(arguments)).join(';');
  // }
  //
  // /*Build a host string from the given configuration.*/
  // protected buildHostString(config: any[], separator: string) {
  //   if (empty(config['port'])) {
  //     return config['host'];
  //   }
  //   return config['host'] + separator + config['port'];
  // }
  //
  // /*Get the available PDO drivers.*/
  // protected getAvailableDrivers() {
  //   return PDO.getAvailableDrivers();
  // }
}
