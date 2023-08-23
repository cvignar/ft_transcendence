import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ParseIntPipe,
  //   Put,
  //   Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';
import { CreateUser } from '../../contracts/user.schema';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('user/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getUserById(id);
  }

  @Get('user')
  async listAllUsers() {
    return await this.userService.listAllUsers();
  }

  @Post('user/create')
  async signupUser(@Body() userData: CreateUser.Request): Promise<UserModel> {
    return this.userService.createUser(userData);
  }
}
