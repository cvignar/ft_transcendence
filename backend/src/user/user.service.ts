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

  async getUserByEmail(userEmail: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    return user;
  }

  async getUserById(userId: number): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  }

  async getBlocks(id: number) {
    const blocksIds = await this.prismaService.user.findMany({
      where: { id: id },
      select: { blocks: true },
    });
    const blockList: User[] = [];
    for (const user of blocksIds) {
      for (let i = 0; i < user.blocks.length; i++) {
        const block = await this.prismaService.user.findUnique({
          where: { id: user.blocks[i] },
        });
        blockList.push(block);
      }
    }
    return blockList;
  }

  async isFriend(userId1: number, userId2: number) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId1 },
      });
      if (user.friends.includes(userId2)) {
        return true;
      }
      return false;
    } catch (e) {
      console.log('IsFriend error: ', e);
    }
  }
}
