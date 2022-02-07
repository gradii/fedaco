/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ConnectionInterface } from '../query-builder/connection-interface';
export interface ConnectionResolverInterface {
    connection(name?: string): ConnectionInterface;
    getDefaultConnection(): any;
    setDefaultConnection(name: string): any;
}
