import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { FedacoModule } from '@gradii/nest-fedaco';

@Module({
  imports: [
    FedacoModule.forRoot({
      'default': {
        driver: 'mysql',
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
