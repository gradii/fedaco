import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { Image } from './models/image.model';
import { User } from './models/user.model';
import { db, schema } from '@gradii/fedaco';
import { faker } from '@faker-js/faker';

@Controller()
export class AppController implements OnModuleInit {
  onModuleInit() {
    db().enableQueryLog();
  }

  @Get('/init-table')
  async initTable() {
    await schema().create('users', table => {
      table.increments('id');
      table.char('name').withLength(250);
      table.char('email').withLength(250);
      table.timestamps();
    });

    await schema().create('posts', table => {
      table.increments('id');
      table.char('name').withLength(250);
      table.timestamps();
    });

    await schema().create('images', function (table) {
      table.increments('id');
      table.morphs('imageable');
      table.string('url');
      table.timestamps();
    });

  }

  @Get('/all-users')
  async getAllUsers() {
    db().flushQueryLog();
    const list = await User.createQuery().get();

    const logs = db().getQueryLog();
    return {list, logs};
  }

  @Get('/add-user')
  async addUser() {
    await User.createQuery().create({
      name : faker.person.fullName(),
      email: faker.internet.email()
    });
  }


  @Get('/all-images')
  async getImages() {
    db().flushQueryLog();
    const list = await Image.createQuery().get();

    const logs = db().getQueryLog();
    return {list, logs};
  }

  @Get('/create-user-image')
  async createUserImage() {
    db().flushQueryLog();
    const user = await User.createQuery().first();

    await user.NewRelation('image').create({
      url: faker.internet.url()
    });

    const logs = await db().getQueryLog();
    return {user, logs};
  }
}
