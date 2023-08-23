import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Prisma } from '@prisma/client';
import { ChannelService } from './channel.service';
import { CreateUser } from '../../contracts/user.schema'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService,
				private channelService: ChannelService) {}

	async getUserById(userId: number) {
		try {
			const user =  await this.prisma.user.findUnique({
				where: { id: userId },
			});
			if (user) {
				return user;
			} else {
				return 'user not found';
			}
		} catch (error) {
			return `getUserById error`;
		}
	}

	async listAllUsers() {
		return await this.prisma.user.findMany();
	}
//   async user(
//     userWhereUniqueInput: Prisma.UserWhereUniqueInput,
//   ): Promise<User | null> {
//     return this.prisma.user.findUnique({
//       where: userWhereUniqueInput,
//     });
//   }

//   async users(params: {
//     skip?: number;
//     take?: number;
//     cursor?: Prisma.UserWhereUniqueInput;
//     where?: Prisma.UserWhereInput;
//     orderBy?: Prisma.UserOrderByWithRelationInput;
//   }): Promise<User[]> {
//     const { skip, take, cursor, where, orderBy } = params;
//     return this.prisma.user.findMany({
//       skip,
//       take,
//       cursor,
//       where,
//       orderBy,
//     });
//   }

  async createUser(userData: CreateUser.Request): Promise<User> {
    return this.prisma.user.create({
		data: {
			id: userData.id,
			email: userData.email,
			username: userData.username,
		},
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
