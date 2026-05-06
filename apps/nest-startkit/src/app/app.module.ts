import { sqliteDriver } from '@gradii/fedaco-sqlite-driver';
import { FedacoModule } from '@gradii/nest-fedaco';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

@Module({
  imports    : [
    FedacoModule.forRoot({
      'default': {
        driver  : 'sqlite',
        factory : sqliteDriver(),
        database: './tmp/example-nest-startkit.sqlite'
      }
    })
  ],
  controllers: [AppController],
  providers  : [],
})
export class AppModule {
}
