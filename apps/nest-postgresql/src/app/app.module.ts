import { postgresDriver } from '@gradii/fedaco-postgres-driver';
import { FedacoModule } from '@gradii/nest-fedaco';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

@Module({
  imports: [
    FedacoModule.forRoot({
      'default': {
        driver: 'pgsql',
        factory: postgresDriver(),
        database: 'nest-postgresql',
        port: 5432
      }
    })
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
