/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

// import { PDO } from "PDO";
import { Connector } from './connector';
import type { ConnectorInterface } from './connector-interface';
import type { WrappedConnection } from './wrapped-connection';

export class PostgresConnector extends Connector implements ConnectorInterface {
  /*The default PDO connection options.*/
  protected options: any = {};

  /*Establish a database connection.*/
  public async connect(config: any[]): Promise<WrappedConnection> {
    // var connection = this.createConnection(this.getDsn(config), config, this.getOptions(config));
    // this.configureEncoding(connection, config);
    // this.configureTimezone(connection, config);
    // this.configureSearchPath(connection, config);
    // this.configureApplicationName(connection, config);
    // this.configureSynchronousCommit(connection, config);
    // return connection;
    throw new Error('method not implemented.');
  }

  // /*Set the connection character set and collation.*/
  // protected configureEncoding(connection: PDO, config: any[]) {
  //     if (!(config["charset"] !== undefined)) {
  //         return;
  //     }
  //     connection.prepare("\"set names '{Config['charset']}'\"").execute();
  // }
  // /*Set the timezone on the connection.*/
  // protected configureTimezone(connection: PDO, config: any[]) {
  //     if (config["timezone"] !== undefined) {
  //         var timezone = config["timezone"];
  //         connection.prepare("\"set time zone '{Timezone}'\"").execute();
  //     }
  // }
  // /*Set the "search_path" on the database connection.*/
  // protected configureSearchPath(connection: PDO, config: any[]) {
  //     if (config["search_path"] !== undefined) {
  //         var searchPath = this.quoteSearchPath(this.parseSearchPath(config["search_path"]));
  //         connection.prepare("\"set search_path to {SearchPath}\"").execute();
  //     }
  // }
  // /*Parse the "search_path" configuration value into an array.*/
  // protected parseSearchPath(searchPath: string | any[]) {
  //     if (is_string(searchPath)) {
  //         preg_match_all("/[a-zA-z0-9$]{1,}/i", searchPath, matches);
  //         var searchPath = matches[0];
  //     }
  //     array_walk(searchPath, schema => {
  //         var schema = trim(schema, "'\"");
  //     });
  //     return searchPath;
  // }
  // /*Format the search path for the DSN.*/
  // protected quoteSearchPath(searchPath: any[] | string) {
  //     return count(searchPath) === 1 ? "\"" + searchPath[0] + "\"" : "\"" + searchPath.join("\", \"") + "\"";
  // }
  // /*Set the application name on the connection.*/
  // protected configureApplicationName(connection: PDO, config: any[]) {
  //     if (config["application_name"] !== undefined) {
  //         var applicationName = config["application_name"];
  //         connection.prepare("\"set application_name to 'ApplicationName'\"").execute();
  //     }
  // }
  // /*Create a DSN string from a configuration.*/
  // protected getDsn(config: any[]) {
  //     extract(config, EXTR_SKIP);
  //     var host = host !== undefined ? "\"host={Host};\" " : "";
  //     var dsn = "\"pgsql:{Host}dbname={Database}\"";
  //     if (config["port"] !== undefined) {
  //         dsn += "\";port={Port}\"";
  //     }
  //     return this.addSslOptions(dsn, config);
  // }
  // /*Add the SSL options to the DSN.*/
  // protected addSslOptions(dsn: string, config: any[]) {
  //     [].forEach((option, index) => {
  //     });
  //     return dsn;
  // }
  // /*Configure the synchronous_commit setting.*/
  // protected configureSynchronousCommit(connection: PDO, config: any[]) {
  //     if (!(config["synchronous_commit"] !== undefined)) {
  //         return;
  //     }
  //     connection.prepare("\"set synchronous_commit to '{Config['synchronous_commit']}'\"").execute();
  // }
}
