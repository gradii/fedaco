import { ConnectionConfig, Model } from '@gradii/fedaco';
import { DynamicModule, Module } from '@nestjs/common';
import { FedacoCoreModule } from './fedaco-core.module';

@Module({})
export class FedacoModule {
  static forRoot(options: { [key: string]: ConnectionConfig }): DynamicModule {
    return {
      module : FedacoModule,
      imports: [FedacoCoreModule.forRoot(options)],
    };
  }
}
