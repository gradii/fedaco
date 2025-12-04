/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import type { ConnectionInterface } from '../query-builder/connection-interface';

export interface ConnectionResolverInterface {
  /* Get a database connection instance. */
  connection(name?: string): ConnectionInterface;

  /* Get the default connection name. */
  getDefaultConnection(): any;

  /* Set the default connection name. */
  setDefaultConnection(name: string): any;
}
