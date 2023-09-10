import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}
  async createUser(userData: {
    username: string;
    email: string;
    hash: string;
    id42: string;
  }): Promise<User> {
    try {
      return await this.prismaService.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          hash: userData.hash,
          id42: parseInt(userData.id42),
        },
      });
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
}
