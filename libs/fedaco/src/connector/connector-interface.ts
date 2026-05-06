/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import type { DriverConnection } from './driver-connection';

export interface ConnectorInterface {
  /* Establish a database connection. */
  connect(config: any[]): Promise<DriverConnection>;
}
