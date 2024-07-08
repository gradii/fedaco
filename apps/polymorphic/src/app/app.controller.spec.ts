import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { FedacoModule } from '@gradii/nest-fedaco';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
      imports:[
        FedacoModule.forRoot({
          'default': {
            driver: 'mysql',
            database: 'test',
            username: 'root',
            password: '123456'
          }
        })
      ]
    }).compile();
  });

  it('getData', async () => {
    const controller = app.get(AppController);
    await controller.addPost();
    await controller.createPostImage();
    const { list } = await controller.getImages();
    expect(list.length).toBeGreaterThan(0);
  });
});

