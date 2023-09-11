import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('create')
  async createUser(
    @Body()
    userData: {
      username: string;
      email: string;
      hash: string;
      id42: string;
    },
  ) {
    return this.userService.createUser(userData);
  }
}
