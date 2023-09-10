import { Controller, Post } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Post('auth')
  async createUser(userData: {
    username: string;
    email: string;
    hash: string;
    id42: string;
  }) {
    return await this.createUser(userData);
  }
}
