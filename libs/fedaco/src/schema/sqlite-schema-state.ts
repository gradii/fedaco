/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SchemaState } from './schema-state';

export class SqliteSchemaState extends SchemaState {
  // /*Dump the database's schema into a file.*/
  // public dump(connection: Connection, path: string) {
  //     _with(process = this.makeProcess(this.baseCommand() + " .schema")).setTimeout(null).mustRun(null, [...this.baseVariables(this.connection.getConfig()), ...[]]);
  //     var migrations = collect(preg_split("/\r\n|\n|\r/", process.getOutput())).filter(line => {
  //         return stripos(line, "sqlite_sequence") === false && strlen(line) > 0;
  //     }).all();
  //     this.files.put(path, migrations.join(PHP_EOL) + PHP_EOL);
  //     this.appendMigrationData(path);
  // }
  // /*Append the migration data to the schema dump.*/
  // protected appendMigrationData(path: string) {
  //     _with(process = this.makeProcess(this.baseCommand() + " \".dump '" + this.migrationTable + "'\"")).mustRun(null, [...this.baseVariables(this.connection.getConfig()), ...[]]);
  //     var migrations = collect(preg_split("/\r\n|\n|\r/", process.getOutput())).filter(line => {
  //         return preg_match("/^\\s*(--|INSERT\\s)/iu", line) === 1 && strlen(line) > 0;
  //     }).all();
  //     this.files.append(path, migrations.join(PHP_EOL) + PHP_EOL);
  // }
  // /*Load the given schema file into the database.*/
  // public load(path: string) {
  //     var process = this.makeProcess(this.baseCommand() + " < \"${:LARAVEL_LOAD_PATH}\"");
  //     process.mustRun(null, [...this.baseVariables(this.connection.getConfig()), ...{
  //             "LARAVEL_LOAD_PATH": path
  //         }]);
  // }
  // /*Get the base sqlite command arguments as a string.*/
  // protected baseCommand() {
  //     return "sqlite3 \"${:LARAVEL_LOAD_DATABASE}\"";
  // }
  // /*Get the base variables for a dump / load command.*/
  // protected baseVariables(config: any[]) {
  //     return {
  //         "LARAVEL_LOAD_DATABASE": config["database"]
  //     };
  // }
}
