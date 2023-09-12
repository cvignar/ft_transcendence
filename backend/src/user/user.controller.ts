import { Body, Controller, ParseIntPipe, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { UserService } from './user.service';
import { CreateUser } from '../../../contracts/user.schema';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UsePipes(ZodValidationPipe)
  //@ApiTags('pong72')
  @Post('create')
  //@ApiOperation({ summary: 'Create user' })
  async createUser(
    @Body()
    userData: CreateUser.Request,
  ): Promise<User> {
    return this.userService.createUser(userData);
  }
}
