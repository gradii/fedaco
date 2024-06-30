import { ConnectionConfig, Model } from '@gradii/fedaco';
import { CircularDependencyException } from '../exceptions/circular-dependency.exception';
import { DEFAULT_CONNECTION_NAME } from '../fedaco.constants';

/**
 * This function generates an injection token for an Repostiory
 * @param {Function} This parameter can either be a Repostiory
 * @param {string} [connection='default'] Connection name
 * @returns {string} The Entity injection token
 */
export function getModelToken(
  entity: typeof Model,
  connection: string = DEFAULT_CONNECTION_NAME,
) {
  if ((entity === null) || (entity === undefined)) {
    throw new CircularDependencyException('@InjectModel()');
  }
  const connectionPrefix = getConnectionPrefix(connection);
  return `${connectionPrefix}${entity.name}`;
}

/**
 * This function returns a Connection injection token for the given SequelizeModuleOptions or connection name.
 * @param {FedacoModuleOptions | string} [connection='default'] This optional parameter is either
 * a SequelizeModuleOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionToken(
  connection: ConnectionConfig | string = DEFAULT_CONNECTION_NAME,
): string {
  return 'string' === typeof connection
    ? `${connection}`
    : `${connection.name}`;
}

/**
 * This function returns a Connection prefix based on the connection name
 * @param {FedacoModuleOptions | string} [connection='default'] This optional parameter is either
 * a SequelizeModuleOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionPrefix(
  connection: ConnectionConfig | string = DEFAULT_CONNECTION_NAME,
): string {
  if (connection === DEFAULT_CONNECTION_NAME) {
    return '';
  }
  if (typeof connection === 'string') {
    return connection + '_';
  }
  if (connection.name === DEFAULT_CONNECTION_NAME || !connection.name) {
    return '';
  }
  return connection.name + '_';
}