import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
// import { ChannelService } from './channel.service';
import { CreateUser, UpdateAvatar, UpdateEmail, UpdateUsername } from '../../../zod_contracts/user.schema'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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


  	async createUser(userData: CreateUser.Request): Promise<User> {
	try{
		const user = await this.prisma.user.create({
			data: {
				id: userData.id,
				username: userData.username,
				email: userData.email,
				hash: userData.hash,
			},
		});
		return user;
	}
	catch (error) {
		console.error(`createChannel error: ${error}`);
		// throw new WsException(error.message);
	}
  }

  	async getAllUsers() {
	//returns a record of all the users, ordered by id in acending order
	try {
		const userList = await this.prisma.user.findMany({
			orderBy: 
			{
				id: 'asc',
			},
			select: {
				id: true,
				username: true,
				email: true,
				avatar: true,
			}
		});
		return userList;
	}
	catch (error) {
		return `getAllUsers error`;
	}
}

//   async updateUser(params: {
//     where: Prisma.UserWhereUniqueInput;
//     data: Prisma.UserUpdateInput;
//   }): Promise<User> {
//     const { where, data } = params;
//     return this.prisma.user.update({
//       data,
//       where,
//     });
//   }

 	async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

/*	UPDATE	*/

	async updateUsername(updateData: UpdateUsername.Request): Promise<User> {
		try {
			const updateUser = await this.prisma.user.update({
				where: { id: updateData.id },
				data: { username: updateData.username },
			});
			return updateUser;
		} catch (error) {
			console.log(`updateUsername error: ${error}`);
		}
	}

	async updateEmail(updateData: UpdateEmail.Request): Promise<User> {
		try {
			const updateUser = await this.prisma.user.update({
				where: { id: updateData.id },
				data: { email: updateData.email },
			});
			return updateUser;
		} catch (error) {
			console.log(`updateEmail error: ${error}`);
		}
	}

	async updateAvatar(updateData: UpdateAvatar.Request): Promise<User> {
		try {
			const updateUser = await this.prisma.user.update({
				where: { id: updateData.id },
				data: { avatar: updateData.avatar },
			});
			return updateUser;
		}
		catch (error) {
			console.log(`updateAvatar error: ${error}`);
		}
	}


	
}

