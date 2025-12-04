import type { Connection } from './connection';
import { Model } from './fedaco/model';
import { type SchemaBuilder } from './schema/schema-builder';

export function db(connectionName = 'default'): Connection {
  return Model.getConnectionResolver().connection(connectionName) as Connection;
}

export function schema(connectionName = 'default'): SchemaBuilder {
  return db(connectionName).getSchemaBuilder();
}
