import { ConnectionConfig, Model } from '@gradii/fedaco';
import { DynamicModule, Module } from '@nestjs/common';
import { FedacoCoreModule } from './fedaco-core.module';
import { DEFAULT_CONNECTION_NAME } from './fedaco.constants';
import { createFedacoProviders } from './fedaco.providers';

@Module({})
export class FedacoModule {
  static forRoot(options: { [key: string]: ConnectionConfig }): DynamicModule {
    return {
      module : FedacoModule,
      imports: [FedacoCoreModule.forRoot(options)],
    };
  }

  static forFeature(
    entities: typeof Model[] = [],
    connection: string       = DEFAULT_CONNECTION_NAME,
  ): DynamicModule {
    const providers = createFedacoProviders(entities, connection);
    return {
      module   : FedacoModule,
      providers: providers,
      exports  : providers,
    };
  }
}
