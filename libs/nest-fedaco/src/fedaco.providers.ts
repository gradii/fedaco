import { Model } from '@gradii/fedaco';
import { Provider } from '@nestjs/common';
import { getConnectionToken, getModelToken } from './common/fedaco.utils';

export function createFedacoProviders(
  entities?: typeof Model[],
  connection?: string,
): Provider[] {
  const repositories = (entities || []).map(entity => ({
    provide   : getModelToken(entity, connection),
    useFactory: (connection: string) => {
      entity.useConnection(connection);
      return entity;
    },
    inject    : [getConnectionToken(connection)],
  }));

  return [...repositories];
}
