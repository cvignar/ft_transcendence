import { ForbiddenException, Injectable } from '@nestjs/common';
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

	async removeFriend(user1Id: number, user2Id: number) {
		if (user1Id == user2Id || !(await this.isFriend(user1Id, user2Id))) {
			throw new ForbiddenException('Cannot remove this friend');
		}
		const user1 = await this.prismaService.user.findUnique({
			where: {
				id: user1Id,
			},
		});
		const index1 = user1.friends.indexOf(user2Id);
		if (index1 != -1) {
			user1.friends.splice(index1, 1);
		}
		await this.prismaService.user.update({
			where: {
				id: user1Id,
			},
			data: {
				friends: user1.friends,
			},
		});
		const user2 = await this.prismaService.user.findUnique({
			where: {
				id: user2Id,
			},
		});
		const index2 = user2.friends.indexOf(user1Id);
		if (index2 != -1) {
			user2.friends.splice(index2, 1);
		}
		await this.prismaService.user.update({
			where: {
				id: user2Id,
			},
			data: {
				friends: user2.friends,
			},
		});
		return user1;
	}

	async isBlocked(userId1: number, userId2: number) {
		try {
			const user = await this.prismaService.user.findUnique({
				where: {
					id: userId1,
				},
			});
			if (user.blocks.includes(userId2)) {
				return true;
			}
			const user2 = await this.prismaService.user.findUnique({
				where: {
					id: userId2,
				},
			});
			if (user2.blocks.includes(userId1)) {
				return true;
			}
			return false;
		} catch (e) {
			throw new ForbiddenException('isBlocked error: ' + e);
		}
	}
	async blockUser(userId: number, blockId: number) {
		if (userId == blockId || (await this.isBlocked(userId, blockId))) {
			throw new ForbiddenException('Failed to block this user');
		}
		if (await this.isFriend(userId, blockId)) {
			await this.removeFriend(userId, blockId);
		}
		const user = await this.prismaService.user.update({
			where: { id: userId },
			data: { blocks: { push: blockId } },
		});
		return user;
	}

	async getUsers(): Promise<
		{ id: number; username: string; avatar: string }[]
		> {
		try {
			const users = await this.prismaService.user.findMany({
				select: {
					id: true,
					username: true,
					avatar: true,
				},
			});
			return users;
		} catch (e) {
			console.log('getUsers error:', e);
			throw new ForbiddenException('getUsers error: ' + e);
		}
	}

	async updatePlayTime(userId: number, duration: number) {
		const user = await this.prismaService.user.update({
			where: { id: userId },
			data: { playTime: { increment: duration } },
		});
		return user;
	}

	async updateGamesWinPlayed(userId: number) {
		await this.prismaService.user.update({
			where: { id: userId },
			data: {
				gamesWon: { increment: 1 },
				gamesPlayed: { increment: 1 },
			},
		});
		return this.updateWinRate(userId);
	}

	async updateGamesLostPlayed(userId: number) {
		await this.prismaService.user.update({
			where: { id: userId },
			data: {
				gamesLost: { increment: 1 },
				gamesPlayed: { increment: 1 },
			},
		});
		return this.updateWinRate(userId);
	}

	async updateWinRate(userId: number) {
		const user = await this.prismaService.user.findUnique({
			where: { id: userId },
		});
		const winRate = user.gamesWon / user.gamesPlayed;
		return await this.prismaService.user.update({
			where: { id: userId },
			data: { winRate: winRate },
		});
	}

	async updateRanks() {
		const users = await this.prismaService.user.findMany({
			orderBy: { score: 'desc' },
			select: { id: true, score: true },
		});
		const userIds: number[] = [];
		for (const user of users) {
			if (user.score !== 1200) {
				userIds.push(user.id);
			}
		}
		let index = 1;
		for (const id of userIds) {
			await this.prismaService.user.update({
				where: { id: id },
				data: { rank: index },
			});
			index++;
		}
		return;
	}
}
