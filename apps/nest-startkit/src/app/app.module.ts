import { FedacoModule } from '@gradii/nest-fedaco';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

@Module({
  imports    : [
    FedacoModule.forRoot({
      'default': {
        driver  : 'sqlite',
        database: './tmp/example-nest-startkit.sqlite'
      }
    })
  ],
  controllers: [AppController],
  providers  : [],
})
export class AppModule {
}
