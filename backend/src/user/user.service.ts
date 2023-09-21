import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as argon from 'argon2';
// import { ChannelService } from './channel.service';
import { CreateUser,CreateUser42, UpdateAvatar, UpdateEmail, UpdateTwoFA, UpdateUsername } from '../../../contracts/user.schema';

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

	async getUserByIntra(userName: string) {
		try {
			const user =  await this.prisma.user.findUnique({
				where: { intra42: userName},
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


//   async createUser(userData: CreateUser.Request): Promise<User> {
// 	  try{
//       const user = await this.prisma.user.create({
//         data: {
//           id42: userData.id42,
//           username: userData.username,
//           email: userData.email,
//           hash: userData.hash,
//         },
// 		});
// 		return user;
// 	}
// 	catch (error) {
// 		console.error(`createChannel error: ${error}`);
// 		// throw new WsException(error.message);
// 	}
//   }
	async createUser(userData: CreateUser42.Request): Promise<User> {
		try{
		const rdm_string = this.generate_random_password();
			// hash password using argon2
		const hash = await argon.hash(rdm_string);
		const user = await this.prisma.user.create({
		data: {
			intra42: userData.intra42,
			id42: userData.id42,
			username: userData.username,
			email: userData.email,
			hash: hash,
		},
		});
		return user;
	}
	catch (error) {
		console.error(`createChannel error: ${error}`);
		// throw new WsException(error.message);
	}
	}

  async createFrom42(json: JSON): Promise<User | null>
	{
		let user = await this.getUserByIntra(json['login']);

		if (!user) {
			try{
				const user = this.createUser({
					intra42: json['login'],
					id42: json['id'],
					username: json['login'],
					email: json['email'],
				  });
				  return user;
			  }
			  catch (error) {
				  console.error(`createChannel error: ${error}`);
				  // throw new WsException(error.message);
			  }
		}
	}

  async getIdByEmail(userEmail: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      select: { id: true },
    });
    return user.id;
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

async has2FA(id: number): Promise<boolean> {
	try
	{
		const user = await this.prisma.user.findUnique({
			where: { id: id },
		});
		return user.twoFA;
	}
	catch (error)
	{
		console.log(`has2FA error: ${error}`);
	}
}

async deactivate2FA(updateData: UpdateTwoFA.Request): Promise<User> {
	try {
		const updateUser = await this.prisma.user.update({
			where: { id: updateData.id },
			data: { twoFA: false },
		})
		return updateUser;
	}
	catch (error) {
		console.log(`deactivate2FA error: ${error}`);
	}
}

async activate2FA(updateData: UpdateTwoFA.Request): Promise<User> {
	try {
		const updateUser = await this.prisma.user.update({
			where: { id: updateData.id },
			data: { twoFA: true },
		})
		return updateUser;
	}
	catch (error) {
		console.log(`activate2FA error: ${error}`);
	}
}

// async validate2FA(id: number): Promise<User | null> {
// 	let user = await this.getUserById(id);
// 	if (!user) {
// 		return null;
// 	}
// 	// user.twoFactorAuthenticated = true;
// 	return await this.userRepository.save(user);
// }

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

	// UTILS
	generate_random_password(): string {
		// generate random password for 42 User
		const password =
			Math.random().toString(36).slice(2, 15) +
			Math.random().toString(36).slice(2, 15);
		return password;
	}

}