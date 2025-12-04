/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { ConnectionResolverInterface } from '../interface/connection-resolver-interface';
import type { Model } from './model';

export class ResolveConnection {
  resolvedConnection: WeakMap<any, any> = new WeakMap<object, unknown>();

  /* Resolve a connection instance. */
  resolveConnection(modelStatic: typeof Model, connection: string | null = null) {
    return modelStatic.resolver.connection(connection);
  }

  /* Get the connection resolver instance. */
  getConnectionResolver(modelStatic: typeof Model) {
    return modelStatic.resolver;
  }

  /* Set the connection resolver instance. */
  setConnectionResolver(modelStatic: typeof Model, resolver: ConnectionResolverInterface) {
    modelStatic.resolver = resolver;
  }

  /* Unset the connection resolver for models. */
  unsetConnectionResolver(modelStatic: typeof Model) {
    modelStatic.resolver = null;
  }
}
