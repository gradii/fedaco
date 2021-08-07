import { ConnectionResolverInterface } from '../interface/connection-resolver-interface';


export class ResolveConnection {
  resolvedConnection: WeakMap<any, any> = new WeakMap<object, unknown>();

  /*Resolve a connection instance.*/
  resolveConnection(modelStatic, connection: string | null = null) {
    return modelStatic.resolver.connection(connection);
  }

  /*Get the connection resolver instance.*/
  getConnectionResolver(modelStatic) {
    return modelStatic.resolver;
  }

  /*Set the connection resolver instance.*/
  setConnectionResolver(modelStatic, resolver: ConnectionResolverInterface) {
    modelStatic.resolver = resolver;
  }

  /*Unset the connection resolver for models.*/
  unsetConnectionResolver(modelStatic) {
    modelStatic.resolver = null;
  }
}