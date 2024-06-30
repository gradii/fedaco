import { ConnectionConfig, DatabaseConfig, db } from '@gradii/fedaco';
import { DynamicModule, Global, Inject, Module, OnApplicationShutdown, } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { SEQUELIZE_MODULE_OPTIONS, } from './fedaco.constants';

@Global()
@Module({})
export class FedacoCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(SEQUELIZE_MODULE_OPTIONS)
    private readonly options: { [key: string]: ConnectionConfig },
    private readonly moduleRef: ModuleRef,
  ) {
  }

  static forRoot(options: { [key: string]: ConnectionConfig }): DynamicModule {
    const fedacoModuleOptions = {
      provide : SEQUELIZE_MODULE_OPTIONS,
      useValue: options,
    };
    const connectionProvider     = {
      provide   : 'DB',
      useFactory: () => this.createConnectionFactory(options),
    };

    return {
      module   : FedacoCoreModule,
      providers: [connectionProvider, fedacoModuleOptions],
      exports  : [connectionProvider],
    };
  }

  async onApplicationShutdown() {
    for (const key in this.options) {
      const connection = db(key);
      connection && (await connection.disconnect());
    }
  }

  private static createConnectionFactory(
    options: ConnectionConfig,
  ): DatabaseConfig {
    const db = new DatabaseConfig();

    for (const key in options) {
      db.addConnection(options, key);
    }

    db.bootFedaco();
    db.setAsGlobal();
    return db;
  }
}
