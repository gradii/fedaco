/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import type { WrappedConnection } from './wrapped-connection';

export interface ConnectorInterface {
  /* Establish a database connection. */
  connect(config: any[]): Promise<WrappedConnection>;
}
