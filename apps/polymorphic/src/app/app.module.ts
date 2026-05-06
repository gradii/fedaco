import { mysqlDriver } from '@gradii/fedaco-mysql-driver';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { FedacoModule } from '@gradii/nest-fedaco';

@Module({
  imports: [
    FedacoModule.forRoot({
      'default': {
        driver: 'mysql',
        factory: mysqlDriver(),
        database: 'test',
        username: 'root',
        password: '123456'
      }
    })
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
