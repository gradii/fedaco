import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();
  });

  describe('AppController', () => {
    it('should be defined', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController).toBeDefined();
    });

    it('should expose initTable, addUser, and listUsers methods', () => {
      const appController = app.get<AppController>(AppController);
      expect(typeof appController.initTable).toBe('function');
      expect(typeof appController.addUser).toBe('function');
      expect(typeof appController.listUsers).toBe('function');
    });
  });
});
