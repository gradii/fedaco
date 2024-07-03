import { FedacoModule } from '@gradii/nest-fedaco';
import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppModule } from './app.module';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        FedacoModule.forRoot({
          default: {
            driver: 'sqlite',
            database: './tmp/example-nest-startkit.sqlite',
          },
        }),
      ],
      controllers: [AppController],
      providers: [],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Hello API"', async () => {
      const appController = app.get<AppController>(AppController);
      await appController.initTable();
      await appController.addUser();
      expect((await appController.listUsers()).length).toBeGreaterThan(0);
    });
  });
});
