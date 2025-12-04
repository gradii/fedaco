/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Connection } from '../connection';

export class SchemaState {
  // /*The connection instance.*/
  // protected connection: Connection;
  // /*The filesystem instance.*/
  // protected files: Filesystem;
  // /*The name of the application's migration table.*/
  // protected migrationTable: string = "migrations";
  // /*The process factory callback.*/
  // protected processFactory: callable;
  // /*The output callable instance.*/
  // protected output: callable;
  /* Create a new dumper instance. */
  public constructor(connection: Connection, files?: any, processFactory?: Function) {
    // this.connection     = connection;
    // this.files          = files || new Filesystem();
    // this.processFactory = processFactory || (arguments => {
    //   return Process.fromShellCommandline(());
    // });
    // this.handleOutputUsing(() => {
    // });
  }

  // /*Dump the database's schema into a file.*/
  // public abstract dump(connection: Connection, path: string);
  // /*Load the given schema file into the database.*/
  // public abstract load(path: string);
  // /*Create a new process instance.*/
  // public makeProcess(arguments: any[]) {
  //     return call_user_func(this.processFactory, ());
  // }
  // /*Specify the name of the application's migration table.*/
  // public withMigrationTable(table: string) {
  //     this.migrationTable = table;
  //     return this;
  // }
  // /*Specify the callback that should be used to handle process output.*/
  // public handleOutputUsing(output: callable) {
  //     this.output = output;
  //     return this;
  // }
}
