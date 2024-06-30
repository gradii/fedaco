import type { Connection } from './connection';
import { Model } from './fedaco/model';

export function db(connectionName: string): Connection {
  return Model.getConnectionResolver().connection(connectionName) as Connection;
}