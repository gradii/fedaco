/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ConnectionResolverInterface } from '../interface/connection-resolver-interface';
export declare class ResolveConnection {
    resolvedConnection: WeakMap<any, any>;
    resolveConnection(modelStatic: any, connection?: string | null): any;
    getConnectionResolver(modelStatic: any): any;
    setConnectionResolver(modelStatic: any, resolver: ConnectionResolverInterface): void;
    unsetConnectionResolver(modelStatic: any): void;
}
