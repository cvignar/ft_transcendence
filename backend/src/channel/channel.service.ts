import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
//import { WsException } from '@nestjs/websockets';
import {
	UpdateChannel,
	CreateChannel,
	ChannelPreview,
	SearchPreview,
	CreateDirectChannel,
} from '../../../contracts/channel.schema';
import { typeEnum } from '../../../contracts/enums';
import { WsException } from '@nestjs/websockets';
import { MemberPreview } from 'contracts/user.schema';
import { CreateMessage, MessagePreview } from '../../../contracts/message.schema';
import { Message } from '@prisma/client';
//import { ExceptionWithMessage } from '@prisma/client/runtime/library';

@Injectable()
export class ChannelService {
	constructor(
		private prismaService: PrismaService,
		private userService: UserService,
	) {}

	async showChannels() {
		const channels = await this.prismaService.channel.findMany();
		//let count = 0;
		//for (const [index, channel] of channels.entries()) {
		//  console.log(`channel ${index}: ${channel.name}`);
		//  count = index + 1;
		//}
		//console.log(`total ${count} channels`);
		return channels;
	}

	async getChannelsByUserId(userId: number) {
		const channels = [];
		const user = await this.prismaService.user.findUnique({
			where: { id: userId },
			select: {
				owner: true,
				admin: true,
				member: true,
				invited: true,
			},
		});
		if (user) {
			if (user.owner) {
				for (let i = 0; i < user.owner.length; i++) {
					channels.push(user.owner[i].name);
				}
			}
			if (user.admin) {
				for (let i = 0; i < user.admin.length; i++) {
					channels.push(user.admin[i].name);
				}
			}
			if (user.member) {
				for (let i = 0; i < user.member.length; i++) {
					channels.push(user.member[i].name);
				}
			}
			if (user.invited) {
				for (let i = 0; i < user.invited.length; i++) {
					channels.push(user.invited[i].name);
				}
			}
		}
		return channels;
	}

	async getChannelNameById(channelId: number) {
		try {
			const channel = await this.prismaService.channel.findUnique({
				where: {
					id: channelId,
				},
				select: {
					name: true,
				},
			});
			return channel.name;
		} catch (error) {
			console.error('getChannelNameById error:', error);
			// throw new WsException(error.message);
		}
	}

	async getChannelById(channelId: number) {
		try {
			return await this.prismaService.channel.findUnique({
				where: { id: channelId },
				select: {
					id: true,
					name: true,
					picture: true,
					createdAt: true,
					updatedAt: true,
					type: true,
					password: true,
					owners: true,
					admins: true,
					members: true,
					inviteds: true,
					blocked: true,
					muted: true,
					messages: true,
				},
			});
		} catch (error) {
			console.error('getChannelByChannelId error: ', error);
			throw new WsException(error.message);
		}
	}

	async getDirectChannel(data: CreateDirectChannel.Request) {
		try {
			const userEmail = data.email;
			const targetId = data.id;
			const ids: number[] = [];
			const user = await this.userService.getUserByEmail(userEmail);
			const targetUser = await this.userService.getUserById(targetId);
			if (user.id == targetUser.id) {
				throw new WsException('Cannot create a direct chat with yourself');
			}

			ids.push(user.id, data.id);
			let channels = await this.prismaService.channel.findMany({
				where: { type: typeEnum.DIRECT },
				select: {
					id: true,
					owners: true
				}
			});
			if (channels) {
				for (const channel of channels) {
					if ((channel.owners[0].id === targetUser.id || channel.owners[0].id === user.id)
						&& (channel.owners[1].id === targetUser.id || channel.owners[1].id === user.id)) {
						return channel.id;
					}
				}
			}
			const channel = await this.prismaService.channel.create({
				data: {
					type: typeEnum.DIRECT,
					owners: { connect: ids.map((id) => ({ id: id })) },
					admins: { connect: ids.map((id) => ({ id: id })) },
					members: { connect: ids.map((id) => ({ id: id })) },
				},
			});
			return channel.id;
		} catch (error) {
			console.log(`createDirectChannel error: ${error}`);
			throw new WsException(error.message);
		}
	}

	async createChannel(channelData: CreateChannel.Request) {
		try {
			const channel = await this.prismaService.channel.create({
				data: {
					name: channelData.name,
					type: channelData.type,
					password: channelData.password,
					owners: { connect: { email: channelData.email } },
					admins: { connect: { email: channelData.email } },
					members: {
						connect: channelData.members.map((member) => ({
							id: member.id,
						})),
					},
				},
			});
			return channel.id;
		} catch (e) {
			throw new WsException('Cannot create a channel');
		}
	}

	async inviteUser(channelData: UpdateChannel.Request) {
		try {
			const channel = await this.prismaService.channel.update({
				where: { id: channelData.id },
				data: {
					inviteds: { connect: { id: channelData.memberId } },
				},
			});
			return channel.id;
		} catch (error) {
			console.error(`inviteUser error; ${error}`);
			// throw new WsException(error.message);
		}
	}

	async joinChannel(
		channelData: UpdateChannel.Request,
	): Promise<number | undefined> {
		try {
			const channel = await this.prismaService.channel.findUnique({
				where: { id: channelData.id },
				select: { password: true },
			});
			console.log('passwds: ', channel.password, channelData.password);
			if (channel.password === channelData.password) {
				const updatedChannel = await this.prismaService.channel.update({
					where: { id: channelData.id },
					data: {
						members: { connect: { email: channelData.email } },
						inviteds: { disconnect: { email: channelData.email } },
					},
				});
				return updatedChannel.id;
			}
			return undefined;
		} catch (error) {
			console.error(`addMember error: ${error}`);
			throw new WsException(error);
		}
	}

	async disconnectMember(channelData: UpdateChannel.Request) {
		try {
			const memberId =
				channelData.memberId == -1
					? await (
							await this.userService.getUserByEmail(
								channelData.email,
							)
					  ).id
					: channelData.memberId;
			await this.prismaService.channel.update({
				where: { id: channelData.id },
				data: {
					owners: { disconnect: { id: memberId } },
					admins: { disconnect: { id: memberId } },
					members: { disconnect: { id: memberId } },
					inviteds: { disconnect: { id: memberId } },
				},
			});
			const channel = await this.getChannelById(channelData.id);
			if (channel.owners.length === 0) {
				await this.prismaService.message.deleteMany({
					where: { channelId: channelData.id },
				});
				/* update user! */
				const deletedChannel = await this.prismaService.channel.delete({
					where: { id: channelData.id },
				});
				return deletedChannel;
			}
		} catch (error) {
			console.error(`disconnectMember error: ${error}`);
			// throw new WsException(error.message);
		}
	}

	async inviteMember(channelData: UpdateChannel.Request) {
		try {
			const channel = await this.prismaService.channel.update({
				where: { id: channelData.id },
				data: { inviteds: { connect: { id: channelData.memberId } } },
			});
			return channel.id;
		} catch (error) {
			console.log(`inviteMember error: ${error}`);
			// throw new WsException(error.message)
		}
	}

	async getDirectChannelTarget(channelData: UpdateChannel.Request) {
		try {
			const channel = await this.prismaService.channel.findUnique({
				where: { id: channelData.id },
				select: {
					owners: {
						where: {
							NOT: { email: channelData.email },
						},
						select: { id: true },
					},
				},
			});
			return channel.owners[0];
		} catch (error) {
			console.log(`getDirectChannelTarget error: ${error}`);
			throw new WsException(error.message);
		}
	}

	async getMessages(channelId: number): Promise<MessagePreview.Response[]> {
		try {
			const channel = await this.prismaService.channel.findUnique({
				where: { id: channelId },
				select: {
					messages: {
						orderBy: { createdAt: 'asc' },
						select: {
							id: true,
							msg: true,
							createdAt: true,
							cid: true,
							owner: {
								select: {
									id: true,
									email: true,
									username: true,
									avatar: true,
								},
							},
						},
					},
				},
			});
			//console.log(channel.messages);
			return channel.messages;
		} catch (error) {
			console.log(`inviteMember error: ${error}`);
			// throw new WsException(error.message)
		}
	}

	async getChannelsListById(email: string) {
		try {
			const channelsList = await this.prismaService.user.findUnique({
				where: { email: email },
				select: {
					member: {
						select: {
							id: true,
							type: true,
							name: true,
							password: true,
							updatedAt: true,
							picture: true,
							owners: {
								select: {
									id: true,
									email: true,
									username: true,
									avatar: true
								},
							},
							messages: {
								where: { unsent: false },
								orderBy: { createdAt: 'desc' },
								select: { msg: true },
								take: 1,
							},
						},
						orderBy: { updatedAt: 'desc' }
					},
				},
			});
			return channelsList;
		} catch (e) {
			console.log(e.message);
			//throw new WsException(e);
		}
	}

	//async getChannelsListById(email: string) {
	//  try {
	//    const channelsList = await this.prismaService.user.findUnique({
	//      where: { email: email },
	//      select: {
	//        owner: {
	//          where: { type: typeEnum.DIRECT },
	//          select: {
	//            id: true,
	//            name: true,
	//            picture: true,

	//            type: true,
	//          },
	//        },
	//        //owner: true,
	//        admin: true,
	//        member: true,
	//        invited: true,
	//      },
	//    });
	//    return channelsList;
	//  } catch (e) {
	//    console.log(e.message);
	//    throw new WsException(e);
	//  }
	//}

	async extractPreviews(channelsList: any, email: string) {
		const previews: ChannelPreview.Response[] = [];
		if (channelsList) {
			if (channelsList.owner) {
				for (let i = 0; i < channelsList.owner.length; i++) {
					let name = '';
					let avatar = '';
					console.log(channelsList.owner[i]);
					let ownerId = -1;
					if (channelsList.owner[i].owners.length > 1) {
						ownerId =
							channelsList.owner[i].owners[0].email === email
								? channelsList.owner[i].owners[0].id
								: channelsList.owner[i].owners[1].id;
					}
					console.log(`channel type: ${channelsList.owner[i].type}, channel name: ${channelsList.member[i].name}`);
					if (channelsList.owner[i].type === typeEnum.DIRECT) {
						if (channelsList.owner[i].owners[0].email == email) {
							name = channelsList.owner[i].owners[1].username;
							avatar = channelsList.owner[i].owners[1].avatar;
						} else {
							name = channelsList.owner[i].owners[0].username;
							avatar = channelsList.owner[i].owners[0].avatar;
						}
					}
					const messageCount = channelsList.owner[i].messages
						? channelsList.owner[i].messages.length
						: 0;
					const channelPreview: ChannelPreview.Response = {
						id: channelsList.owner[i].id,
						type: channelsList.owner[i].type,
						name: name,
						updatedAt: channelsList.owner[i].updatedAt,
						lastMessage:
							messageCount > 0
								? channelsList.owner[i].messages[0].msg
								: '',
						ownerEmail: channelsList.owner[i].owners[0].email,
						ownerId: ownerId,
						picture: avatar ? avatar : channelsList.owner[i].picture,
					};
					previews.push(channelPreview);
				}
			}
			if (channelsList.admin) {
				for (let i = 0; i < channelsList.admin.length; i++) {
					let name = '';
					let avatar = '';
					console.log(`channel type: ${channelsList.admin[i].type}, channel name: ${channelsList.member[i].name}`);
					if (channelsList.admin[i].type === typeEnum.DIRECT) {
						if (channelsList.admin[i].owners[0].email == email) {
							name = channelsList.admin[i].owners[1].username;
							avatar = channelsList.admin[i].owners[1].avatar;
						} else {
							name = channelsList.admin[i].owners[0].username;
							avatar = channelsList.admin[i].owners[0].avatar;
						}
					}
					const messageCount = channelsList.admin[i].messages
						? channelsList.admin[i].messages.length
						: 0;
					const channelPreview: ChannelPreview.Response = {
						id: channelsList.admin[i].id,
						type: channelsList.admin[i].type,
						name: name ? name : channelsList.admin[i].name,
						updatedAt: channelsList.admin[i].updatedAt,
						lastMessage:
							messageCount > 0
								? channelsList.admin[i].messages[0].msg
								: '',
						ownerEmail: channelsList.admin[i].owners[0].email,
						ownerId: channelsList.admin[i].owners[0].id,
						picture: avatar ? avatar : channelsList.admin[i].picture,
					};
					previews.push(channelPreview);
				}
			}
			if (channelsList.member) {
				for (let i = 0; i < channelsList.member.length; i++) {
					let name = '';
					let avatar = '';
					console.log(`channel type: ${channelsList.member[i].type}, channel name: ${channelsList.member[i].name}`);
					if (channelsList.member[i].type === typeEnum.DIRECT) {
						if (channelsList.member[i].owners[0].email == email) {
							name = channelsList.member[i].owners[1].username;
							avatar = channelsList.member[i].owners[1].avatar;
						} else {
							name = channelsList.member[i].owners[0].username;
							avatar = channelsList.member[i].owners[0].avatar;
						}
					}
					const messageCount = channelsList.member[i].messages
						? channelsList.member[i].messages.length
						: 0;
					const channelPreview: ChannelPreview.Response = {
						id: channelsList.member[i].id,
						type: channelsList.member[i].type,
						name: name ? name : channelsList.member[i].name,
						updatedAt: channelsList.member[i].updatedAt,
						lastMessage:
							messageCount > 0
								? channelsList.member[i].messages[0].msg
								: '',
						ownerEmail: channelsList.member[i].owners[0].email,
						ownerId: channelsList.member[i].owners[0].id,
						picture: avatar ? avatar : channelsList.member[i].picture,
					};
					previews.push(channelPreview);
				}
			}
			if (channelsList.invited) {
				for (let i = 0; i < channelsList.invited.length; i++) {
					const messageCount = channelsList.invited[i].messages
						? channelsList.invited[i].messages.length
						: 0;
					const channelPreview: ChannelPreview.Response = {
						id: channelsList.invited[i].id,
						type: channelsList.invited[i].type,
						name: channelsList.invited[i].name,
						updatedAt: channelsList.invited[i].updatedAt,
						lastMessage:
							channelsList.invited[i].type === 'protected'
								? ''
								: messageCount > 0
									? channelsList.invited[i].messages[0].msg
									: '',
						//ownerEmail: channelsList.invited[i].ownerEmail,
						//ownerId: channelsList.invited[i].ownerId,
						ownerEmail: channelsList.invited[i].owners[0].email,
						ownerId: channelsList.invited[i].owners[0].id,
					};
					previews.push(channelPreview);
				}
			}
		}
		return previews;
	}

	async getPreviews(email: string): Promise<ChannelPreview.Response[] | []> {
		try {
			const channelsList = await this.getChannelsListById(email);
			const previews = await this.extractPreviews(channelsList, email);
			//console.log(previews);
			return previews;
		} catch (e) {
			console.log(e);
		}
	}

	async extractPreview(
		channel: any,
		email: string,
	): Promise<ChannelPreview.Response> {
		let messageCount = 0;
		if (channel.messages) {
			messageCount = channel.messages.length;
		}
		let name = '';
		let avatar = '';
		if (channel.owners.length > 1) {
			name =
				channel.owners[0].email === email
					? channel.owners[1].username
					: channel.owners[0].username;
			avatar =
				channel.owners[0].email === email
					? channel.owners[1].avatar
					: channel.owners[0].avatar;
		}
		
		let ownerId = -1;
		if (channel.owners.length > 1) {
			ownerId =
				channel.owners[0].email === email
					? channel.owners[1].id
					: channel.owners[0].id;
		} else {
			ownerId = channel.owners[0].id;
		}
		
		const preview: ChannelPreview.Response = {
			id: channel.id,
			type: channel.type,
			name: channel.type === 'direct' ? name : channel.name,
			updatedAt: channel.updatedAt,
			picture: avatar ? avatar : channel.picture,
			lastMessage:
				channel.type === 'protected'
					? ''
					: messageCount > 0
						? channel.messages[0].msg
						: '',
			ownerEmail:
				channel.owners.length > 0 ? channel.owners[0].email : '',
			ownerId: ownerId,
		};
		return preview;
	}
	async getPreview(
		channelId: number,
		email: string,
	): Promise<ChannelPreview.Response> {
		try {
			const channel = await this.getChannelById(channelId);
			const channelPreview = this.extractPreview(channel, email);
			return channelPreview;
		} catch (e) {
			console.log(e.message);
		}
	}

	async makeAdmin(channelData: { userId: number, channelId: number }) {
		const channel = await this.getChannelById(channelData.channelId);
		if (channel) {
			const updatedChannel = await this.prismaService.channel.update({
				where: { id: channelData.channelId },
				data: {
					admins: { connect: { id: channelData.userId } }
				},
			});
			return updatedChannel;
		}
		return undefined;
	}

	async removeAdmin(channelData: { userId: number, channelId: number }) {
		const channel = await this.getChannelById(channelData.channelId);
		console.log(channelData);
		if (channel) {
			const updatedChannel = await this.prismaService.channel.update({
				where: { id: channelData.channelId },
				data: {
					admins: { disconnect: { id: channelData.userId } }
				},
			});
			return updatedChannel;
		}
		return undefined;
	}

	async getRole(
		userId: number,
		channelId: number,
	): Promise<{
		isOwner: boolean;
		isAdmin: boolean;
		isInvited: boolean;
		isBlocked: boolean;
		isMuted: boolean;
	}> {
		try {
			const user = await this.userService.getUserById(userId);
			const channel = await this.prismaService.channel.findUnique({
				where: { id: channelId },
				select: {
					owners: true,
					admins: true,
					inviteds: true,
					blocked: true,
					muted: true,
				},
			});
			let isOwner = false;
			let isAdmin = false;
			let isInvited = false;
			let isBlocked = false;
			let isMuted = false;
			for (let i = 0; i < channel.muted.length; i++) {
				if (userId === channel.muted[i].userId) {
					isMuted = true;
					break;
				}
			}
			for (let i = 0; i < channel.owners.length; i++) {
				if (userId === channel.owners[i].id) {
					isOwner = true;
					break;
				}
			}
			for (let i = 0; i < channel.admins.length; i++) {
				if (userId === channel.admins[i].id) {
					isAdmin = true;
					break;
				}
			}
			for (let i = 0; i < channel.inviteds.length; i++) {
				if (userId === channel.inviteds[i].id) {
					isInvited = true;
					break;
				}
			}
			for (let i = 0; i < channel.blocked.length; i++) {
				if (userId === channel.blocked[i].id) {
					isBlocked = true;
					break;
				}
			}
			const roles = {
				isOwner: isOwner,
				isAdmin: isAdmin,
				isInvited: isInvited,
				isBlocked: isBlocked,
				isMuted: isMuted,
			};
			return roles;
		} catch (e) {
			console.log('get role error: ', e.message);
			throw new WsException(e);
		}
	}

	async getAdmins(userId: number, channelId: number) {
		try {
			const channel = await this.prismaService.channel.findUnique({
				where: { id: channelId },
				select: { admins: true },
			});
			const admins: MemberPreview.Response[] = [];
			if (channel && channel.admins) {
				for (let i = 0; i < channel.admins.length; i++) {
					const roles = await this.getRole(
						channel.admins[i].id,
						channelId,
					);
					const admin: MemberPreview.Response = {
						id: channel.admins[i].id,
						username: channel.admins[i].username,
						email: channel.admins[i].email,
						isOwner: roles.isOwner,
						isAdmin: roles.isAdmin,
						isInvited: roles.isInvited,
						isBlocked: roles.isBlocked,
						isMuted: roles.isMuted,
						isFriend:
							userId != channel.admins[i].id
								? await this.userService.isFriend(
										userId,
										channel.admins[i].id,
								  )
								: false,
					};
					admins.push(admin);
				}
			}
			return admins;
		} catch (e) {
			console.log('get members error: ', e.message);
			throw new WsException(e);
		}
	}

	async getOwners(userId: number, channelId: number) {
		try {
			const channel = await this.prismaService.channel.findUnique({
				where: { id: channelId },
				select: { owners: true },
			});
			const owners: MemberPreview.Response[] = [];
			if (channel && channel.owners) {
				for (let i = 0; i < channel.owners.length; i++) {
					const roles = await this.getRole(
						channel.owners[i].id,
						channelId,
					);
					const owner: MemberPreview.Response = {
						id: channel.owners[i].id,
						username: channel.owners[i].username,
						email: channel.owners[i].email,
						isOwner: roles.isOwner,
						isAdmin: roles.isAdmin,
						isInvited: roles.isInvited,
						isBlocked: roles.isBlocked,
						isMuted: roles.isMuted,
						isFriend:
							userId != channel.owners[i].id
								? await this.userService.isFriend(
										userId,
										channel.owners[i].id,
								  )
								: false,
					};
					owners.push(owner);
				}
			}
			return owners;
		} catch (e) {
			console.log('get members error: ', e.message);
			throw new WsException(e);
		}
	}

	async getMembers(userId: number | null, channelId: number) {
		try {
			const channel = await this.prismaService.channel.findUnique({
				where: { id: channelId },
				select: { members: {
					orderBy: { username: 'asc' }
				} },
			});
			const members: MemberPreview.Response[] = [];
			if (channel && channel.members) {
				for (let i = 0; i < channel.members.length; i++) {
					const roles = await this.getRole(
						channel.members[i].id,
						channelId,
					);
					const member: MemberPreview.Response = {
						id: channel.members[i].id,
						username: channel.members[i].username,
						avatar: channel.members[i].avatar,
						email: channel.members[i].email,
						isOwner: roles.isOwner,
						isAdmin: roles.isAdmin,
						isInvited: roles.isInvited,
						isBlocked: roles.isBlocked,
						isMuted: roles.isMuted,
						isFriend:
							userId && userId != channel.members[i].id
								? await this.userService.isFriend(
										userId,
										channel.members[i].id,
								  )
								: false,
					};
					members.push(member);
				}
			}
			return members;
		} catch (e) {
			console.log('get members error: ', e.message);
			throw new WsException(e);
		}
	}

	async getInviteds(userId: number, channelId: number) {
		try {
			const channel = await this.prismaService.channel.findUnique({
				where: { id: channelId },
				select: { inviteds: true },
			});
			const inviteds: MemberPreview.Response[] = [];
			if (channel && channel.inviteds) {
				for (let i = 0; i < channel.inviteds.length; i++) {
					const invited: MemberPreview.Response = {
						id: channel.inviteds[i].id,
						username: channel.inviteds[i].username,
						email: channel.inviteds[i].email,
						isFriend:
							userId != channel.inviteds[i].id
								? await this.userService.isFriend(
									userId,
									channel.inviteds[i].id,
								  )
								: false,
					};
					inviteds.push(invited);
				}
			}
			return inviteds;
		} catch (e) {
			throw new WsException(e);
		}
	}

	async getBlockers(channelId: number) {
		try {
			const channels = await this.prismaService.channel.findUnique({
				where: { id: channelId },
				select: { blocked: { select: { id: true } } },
			});
			return channels;
		} catch (e) {
			console.log('getBlockeds error: ', e);
			throw new WsException(e);
		}
	}

	async blockChannel(channelData: UpdateChannel.Request) {
		try {
			if (channelData.type === typeEnum.DIRECT) {
				const user = await this.userService.getUserByEmail(
					channelData.email,
				);
				const target = await this.getDirectChannelTarget(channelData);
				await this.userService.blockUser(user.id, target.id);
			}
			const deleted = await this.disconnectMember(channelData);
			if (!deleted) {
				await this.prismaService.channel.update({
					where: {
						id: channelData.id,
					},
					data: {
						blocked: {
							connect: {
								email: channelData.email,
							},
						},
					},
				});
			}
		} catch (error) {
			console.log('blockChannel error:', error);
			throw new WsException(error.message);
		}
	}

	async getChannelsByType(type: typeEnum) {
		try {
			const channels = await this.prismaService.channel.findMany({
				where: { type: type },
			});
			return channels;
		} catch (e) {
			console.log('getChannelsByType error:', e);
			throw new WsException(e.message);
		}
	}

	async getChannelsForSearch() {
		try {
			const channels = await this.prismaService.channel.findMany({
				where: {
					OR: [
						{ type: typeEnum.PUBLIC },
						{ type: typeEnum.PROTECTED }
					]
				},
			});
			return channels;
		} catch (e) {
			console.log('getChannelsByType error:', e);
			throw new WsException(e.message);
		}
	}

	async getSearchPreviews(email: string) {
		try {
			const user = await this.userService.getUserByEmail(email);
			const users = await this.userService.getUsersExclude(user.id);
			const searchChannels = await this.getChannelsForSearch();

			const searchPreviews: SearchPreview.Response[] = [];
			let channelsLength = 0,
				usersLength = 0;

			if (searchChannels) {
				channelsLength = searchChannels.length;
				for (const [key, channel] of searchChannels.entries()) {
					const preview: SearchPreview.Response = {
						id: channel.id,
						key: key,
						name: channel.name,
						picture: channel.picture,
						tag: channel.type + ' channel',
						type: channel.type,
					};
					searchPreviews.push(preview);
				}
			}
			if (users) {
				usersLength = users.length;
				for (const [key, usr] of users.entries()) {
					const preview: SearchPreview.Response = {
						id: usr.id,
						key: channelsLength + key,
						name: usr.username,
						picture: usr.avatar,
						tag: 'user',
					};
					searchPreviews.push(preview);
				}
			}
			return searchPreviews;
		} catch (e) {
			console.log('get__searchSuggest error:', e);
			throw new WsException(e);
		}
	}

	async getMessagePreview(
		messageId: number,
	): Promise<MessagePreview.Response> {
		try {
			return await this.prismaService.message.findUnique({
				where: { id: messageId },
				select: {
					id: true,
					msg: true,
					createdAt: true,
					updatedAt: true,
					owner: true,
					userId: true,
					channel: true,
					cid: true,
					//email: true,
					//invite: true,
				},
			});
		} catch (e) {
			console.log('getMessagePrevie error: ', e);
			throw new WsException(e);
		}
	}
	async createMessage(messageData: CreateMessage.Request) {
		try {
			const user = await this.userService.getUserByEmail(
				messageData.email,
			);
			const channel = await this.getChannelById(messageData.channelId);
			let member = false;
			for (let i = 0; i < channel.owners.length; i++) {
				if (user.id == channel.owners[i].id) {
					member = true;
				}
			}
			if (!member) {
				console.log('!');
				// FIXME!!!!
				return;
			}
			//if (!channel.members.includes(user)) {
			//  return;
			//}
			for (let i = 0; i < channel.muted.length; i++) {
				if (channel.muted[i].userId == user.id) {
					return;
				}
			}
			const message = await this.prismaService.message.create({
				data: {
					msg: messageData.message,
					history: [messageData.message],
					userId: user.id,
					cid: messageData.channelId,
				},
			});
			await this.prismaService.message.update({
				where: { id: message.id },
				data: { updatedAt: message.updatedAt },
			});
			return await this.getMessagePreview(message.id);
		} catch (e) {
			console.log('createMessage error: ', e);
			throw new WsException(e);
		}
	}

	async deleteMessage(messageData: MessagePreview.Response) {
		try {
			await this.prismaService.message.update({
				where: { id: messageData.id },
				data: { unsent: true },
			});
		} catch (e) {
			console.log('deleteMessage error: ', e);
			throw new WsException(e);
		}
	}
}
