import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { Image } from './models/image.model';
import { User } from './models/user.model';
import { db, schema } from '@gradii/fedaco';
import { faker } from '@faker-js/faker';
import { Post } from './models/post.model';

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

  @Get('/add-post')
  async addPost() {
    await Post.createQuery().create({
      name : faker.person.fullName(),
    });
  }



  @Get('/all-images')
  async getImages() {
    db().flushQueryLog();
    const list = await Image.createQuery().with('imageable').get();

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

  @Get('/create-post-image')
  async createPostImage() {
    db().flushQueryLog();
    const post = await Post.createQuery().first();

    await post.NewRelation('image').create({
      url: faker.internet.url()
    });

    const logs = await db().getQueryLog();
    return {post, logs};
  }


  @Get('/get-user-image')
  async getUserImage() {
    db().flushQueryLog();

    const user = await User.createQuery().first();
    const image = await user.image;
    const logs = await db().getQueryLog();
    return {user, image, logs};
  }

  @Get('/get-image-user')
  async getImageUser() {
    db().flushQueryLog();

    const image = await Image.createQuery().first();
    const user = await image.imageable;
    const logs = await db().getQueryLog();
    return {image, user, logs};
  }
}
