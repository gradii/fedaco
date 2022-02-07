/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { WrappedConnection } from './wrapped-connection';
export interface ConnectorInterface {
    connect(config: any[]): Promise<WrappedConnection>;
}
