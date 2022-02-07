/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ConnectionResolverInterface } from '../interface/connection-resolver-interface';
import type { Model } from './model';
export declare class ResolveConnection {
    resolvedConnection: WeakMap<any, any>;
    resolveConnection(modelStatic: typeof Model, connection?: string | null): import("@gradii/fedaco").ConnectionInterface;
    getConnectionResolver(modelStatic: typeof Model): ConnectionResolverInterface;
    setConnectionResolver(modelStatic: typeof Model, resolver: ConnectionResolverInterface): void;
    unsetConnectionResolver(modelStatic: typeof Model): void;
}
