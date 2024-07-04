import { FedacoModule } from '@gradii/nest-fedaco';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

@Module({
  imports: [
    FedacoModule.forRoot({
      'default': {
        driver: 'pgsql',
        database: 'nest-postgresql'
      }
    })
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
