import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUser } from '../../../contracts/user.schema--';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}
  async createUser(userData: CreateUser.Request): Promise<User> {
    return await this.prismaService.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        id42: userData.id42,
        hash: userData.hash,
      },
    });
  }

  async getIdByEmail(userEmail: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: userEmail,
      },
      select: { id: true },
    });
    return user.id;
  }
}
