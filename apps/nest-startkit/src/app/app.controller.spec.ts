import { sqliteDriver } from '@gradii/fedaco-sqlite-driver';
import { FedacoModule } from '@gradii/nest-fedaco';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AppController } from './app.controller';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        FedacoModule.forRoot({
          default: {
            driver: 'sqlite',
            factory: sqliteDriver(),
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
