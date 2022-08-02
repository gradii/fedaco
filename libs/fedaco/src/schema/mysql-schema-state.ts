/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SchemaState } from './schema-state';

// import { Exception } from 'Exception';
// import { Connection } from 'Illuminate/Database/Connection';
// import { Str } from 'Illuminate/Support/Str';
// import { Process } from 'Symfony/Component/Process/Process';

export class MySqlSchemaState extends SchemaState {
  // /*Dump the database's schema into a file.*/
  // public dump(connection: Connection, path: string) {
  //   this.executeDumpProcess(this.makeProcess(
  //     this.baseDumpCommand() + ' --routines --result-file="${:LARAVEL_LOAD_PATH}" --no-data'),
  //     this.output, [
  //       ...this.baseVariables(this.connection.getConfig()), ...{
  //         'LARAVEL_LOAD_PATH': path
  //       }
  //     ]);
  //   this.removeAutoIncrementingState(path);
  //   this.appendMigrationData(path);
  // }
  //
  // /*Remove the auto-incrementing state from the given schema dump.*/
  // protected removeAutoIncrementingState(path: string) {
  //   this.files.put(path, preg_replace('/\\s+AUTO_INCREMENT=[0-9]+/iu', '', this.files.get(path)));
  // }
  //
  // /*Append the migration data to the schema dump.*/
  // protected appendMigrationData(path: string) {
  //   var process = this.executeDumpProcess(this.makeProcess(
  //     this.baseDumpCommand() + ' ' + this.migrationTable + ' --no-create-info --skip-extended-insert --skip-routines --compact'),
  //     null, [...this.baseVariables(this.connection.getConfig()), ...[]]);
  //   this.files.append(path, process.getOutput());
  // }
  //
  // /*Load the given schema file into the database.*/
  // public load(path: string) {
  //   var command = 'mysql ' + this.connectionString() + ' --database="${:LARAVEL_LOAD_DATABASE}" < "${:LARAVEL_LOAD_PATH}"';
  //   var process = this.makeProcess(command).setTimeout(null);
  //   process.mustRun(null, [
  //     ...this.baseVariables(this.connection.getConfig()), ...{
  //       'LARAVEL_LOAD_PATH': path
  //     }
  //   ]);
  // }
  //
  // /*Get the base dump command arguments for MySQL as a string.*/
  // protected baseDumpCommand() {
  //   var command = 'mysqldump ' + this.connectionString() + ' --skip-add-locks --skip-comments --skip-set-charset --tz-utc';
  //   if (!this.connection.isMaria()) {
  //     command += ' --column-statistics=0 --set-gtid-purged=OFF';
  //   }
  //   return command + ' "${:LARAVEL_LOAD_DATABASE}"';
  // }
  //
  // /*Generate a basic connection string (--socket, --host, --port, --user, --password) for the database.*/
  // protected connectionString() {
  //   var value = ' --user="${:LARAVEL_LOAD_USER}" --password="${:LARAVEL_LOAD_PASSWORD}"';
  //   value += (this.connection.getConfig()['unix_socket'] ?? false) ? ' --socket="${:LARAVEL_LOAD_SOCKET}"' : ' --host="${:LARAVEL_LOAD_HOST}" --port="${:LARAVEL_LOAD_PORT}"';
  //   return value;
  // }
  //
  // /*Get the base variables for a dump / load command.*/
  // protected baseVariables(config: any[]) {
  //   config['host'] = config['host'] ?? '';
  //   return {
  //     'LARAVEL_LOAD_SOCKET'  : config['unix_socket'] ?? '',
  //     'LARAVEL_LOAD_HOST'    : is_array(config['host']) ? config['host'][0] : config['host'],
  //     'LARAVEL_LOAD_PORT'    : config['port'] ?? '',
  //     'LARAVEL_LOAD_USER'    : config['username'],
  //     'LARAVEL_LOAD_PASSWORD': config['password'] ?? '',
  //     'LARAVEL_LOAD_DATABASE': config['database']
  //   };
  // }
  //
  // /*Execute the given dump process.*/
  // protected executeDumpProcess(process: Process, output: callable, variables: any[]) {
  //   try {
  //     process.setTimeout(null).mustRun(output, variables);
  //   } catch (e: Exception) {
  //     if (Str.contains(e.getMessage(), ['column-statistics', 'column_statistics'])) {
  //       return this.executeDumpProcess(Process.fromShellCommandLine(
  //         str_replace(' --column-statistics=0', '', process.getCommandLine())), output, variables);
  //     }
  //     if (Str.contains(e.getMessage(), ['set-gtid-purged'])) {
  //       return this.executeDumpProcess(Process.fromShellCommandLine(
  //         str_replace(' --set-gtid-purged=OFF', '', process.getCommandLine())), output, variables);
  //     }
  //     throw e;
  //   }
  //   return process;
  // }
}
