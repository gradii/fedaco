import {faker} from '@faker-js/faker';
import {schema} from '@gradii/fedaco';
import {Controller, Get} from '@nestjs/common';
import {UserModel} from './models/user.model';

@Controller()
export class AppController {
  constructor() {
  }

  @Get('/init-table')
  async initTable() {
    if (!await schema().hasTable('users')) {
      await schema().create('users', table => {
        table.increments('id');
        table.string('username');
        table.timestamps();
      });
    }
  }

  @Get('/add-user')
  async addUser() {
    await UserModel.createQuery().create({
      username: faker.finance.accountName()
    });
  }

  @Get('/list-user')
  async listUsers() {
    return await UserModel.createQuery().get();
  }
}
