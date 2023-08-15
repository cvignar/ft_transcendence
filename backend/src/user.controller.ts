import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  //   Put,
  //   Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('user/:id')
  async getUserById(@Param('id') id: string): Promise<UserModel> {
    return this.userService.user({ id: Number(id) });
  }

  @Post('user/create')
  async signupUser(
    @Body() userData: { id: string; username?: string; email: string },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }
}
