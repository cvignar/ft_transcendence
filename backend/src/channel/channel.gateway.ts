import { UseFilters, UsePipes } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { ChannelService } from './channel.service';
import { ZodValidationPipe } from 'nestjs-zod';
import {
	HttpToWsFilter,
	ProperWsFilter,
} from '../http-exception-to-websocket-exception/http-exception-to-websocket-exception.filter';
import {
	CreateChannel,
	CreateDirectChannel,
	UpdateChannel,
} from 'contracts/channel.schema';
import {
	CreateMessage,
	MessagePreview,
} from '../../../contracts/message.schema';
import { MemberPreview, UpdateUser } from 'contracts/user.schema';
import { Role } from 'contracts/enums';

@UsePipes(new ZodValidationPipe())
@UseFilters(new HttpToWsFilter())
@UseFilters(new ProperWsFilter())
@WebSocketGateway()
export class ChannelGateway {
	@WebSocketServer()
	server: Server;

	constructor(
		private channelService: ChannelService,
		private userService: UserService,
	) {}

	async handleJoinSocket(id: number, @ConnectedSocket() client: Socket) {
		const channels = await this.channelService.getChannelsByUserId(id);
		if (channels)
			for (const channel of channels) {
				await client.join(channel);
			}
	}

	@SubscribeMessage('get preview')
	async getPreview(@MessageBody() email: string) {
		const previews = await this.channelService.getPreviews(email);
		return previews;
	}

	@SubscribeMessage('add preview')
	async addPreview(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket,
	) {
		const preview = await this.channelService.getPreview(
			data.channelId,
			data.email,
		);
		client.join(preview.name);
		client.emit('add preview', preview);
	}

	@SubscribeMessage('get selected channel')
	async getSelectedChannel(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket,
	) {
		if (data.channelId == undefined || data.email == undefined) {
			return;
		}
		const preview = await this.channelService.getPreview(
			data.channelId,
			data.email,
		);
		if (preview) {
			client.join(preview.name);
			client.emit('get selected channel', preview);
			const user = await this.userService.getUserByEmail(data.email);
			const members = await this.channelService.getMembers(
				user.id,
				data.channelId,
			);
			client.emit('get members', members);
		}
	}

	@SubscribeMessage('get blocked')
	async getBlocked(
		@MessageBody() email: string,
		@ConnectedSocket() client: Socket,
	) {
		const blockList = await this.userService.getBlocks(client.data.id);
		client.emit('get blocked', blockList);
	}

	@SubscribeMessage('create channel')
	async createChannel(
		@MessageBody() channelData: CreateChannel.Request,
		@ConnectedSocket() client: Socket,
	) {
		if (
			!channelData.name ||
			channelData.name.length < 1 ||
			channelData.name === undefined
		) {
			client.emit('exception', 'Channel name must not be empty');
			return;
		}
		const channelId = await this.channelService.createChannel(channelData);
		if (channelId == undefined) {
			client.emit('exception', 'failed to create channel, try again');
		} else {
			const preview = await this.channelService.getPreview(
				channelId,
				channelData.email,
			);
			client.join(preview.name);
			client.emit('add preview', preview);
			client.emit('channel created', preview);
			this.server.in('all').emit('update channel request');
		}
	}

	@SubscribeMessage('join channel')
	async joinChannel(
		@MessageBody() channelData: UpdateChannel.Request,
		@ConnectedSocket() client: Socket,
	) {
		const channelId = await this.channelService.joinChannel(channelData);
		if (channelId == undefined) {
			client.emit('exception', 'Cannot join channel');
		} else {
			const channelName = await this.channelService.getChannelNameById(
				channelData.id,
			);
			client.join(channelName);
			const user = await this.userService.getUserByEmail(
				channelData.email,
			);
			const preview = await this.channelService.getPreviews(
				channelData.email,
			);
			client.emit('update preview', preview);
			const members = await this.channelService.getMembers(
				user.id,
				channelData.id,
			);
			client.emit('get members', members);
			this.server.in('all').emit('update channel request');
		}
	}

	@SubscribeMessage('invite to channel')
	async inviteToChannel(
		@MessageBody() channelData: UpdateChannel.Request,
		@ConnectedSocket() client: Socket,
	) {
		await this.channelService.inviteMember(channelData);
		const user = await this.userService.getUserByEmail(channelData.email);
		const inviteds = await this.channelService.getInviteds(
			user.id,
			channelData.id,
		);
		client.emit('get inviteds', inviteds);
		this.server.in('all').emit('update channel request');
	}

	@SubscribeMessage('block channel')
	async blockChannel(
		@MessageBody() channelData: UpdateChannel.Request,
		@ConnectedSocket() client: Socket,
	) {
		const channelName = await this.channelService.getChannelNameById(
			channelData.id,
		);
		await this.channelService.blockChannel(channelData);
		const previews = await this.channelService.getPreviews(
			channelData.email,
		);
		client.emit('update preview', previews);
		const search = await this.channelService.getSearchPreviews(
			channelData.email,
		);
		client.emit('update search', search);
		client.emit('get owners', []);
		client.emit('get admins', []);
		client.emit('get members', []);
		client.emit('get inviteds', []);
		this.server.in(channelName).emit('update channel request');
	}

	@SubscribeMessage('leave channel')
	async handleDeleteChannel(
		@MessageBody() channelData: UpdateChannel.Request,
		@ConnectedSocket() client: Socket,
	) {
		const channelName = await this.channelService.getChannelNameById(
			channelData.id,
		);
		await this.channelService.disconnectMember(channelData);
		const preview = await this.channelService.getPreviews(
			channelData.email,
		);
		client.emit('update preview', preview);
		const search = await this.channelService.getSearchPreviews(
			channelData.email,
		);
		client.emit('update search', search);
		client.emit('get owners', []);
		client.emit('get admins', []);
		client.emit('get members', []);
		client.emit('get inviteds', []);
		this.server.in(channelName).emit('update channel request');
	}

	@SubscribeMessage('kick out')
	async kickOut(
		@MessageBody() channelData: UpdateChannel.Request,
		@ConnectedSocket() client: Socket,
	) {
		const channelName = await this.channelService.getChannelNameById(
			channelData.id,
		);
		await this.channelService.disconnectMember(channelData);
		const user = await this.userService.getUserByEmail(channelData.email);
		const admins = await this.channelService.getAdmins(
			user.id,
			channelData.id,
		);
		client.emit('get admins', admins);
		const members = await this.channelService.getMembers(
			user.id,
			channelData.id,
		);
		client.emit('get members', members);
		const inviteds = await this.channelService.getInviteds(
			user.id,
			channelData.id,
		);
		client.emit('get inviteds', inviteds);
		let filter = [];
		const users = await this.userService.getUsers();
		const blockers = await this.channelService.getBlockers(channelData.id);
		const filteredMembers = users.filter((usr) => {
			return !members.some((member) => {
				return usr.id === member.id;
			});
		});
		if (blockers.blocked.length > 0) {
			const filteredBlockers = filteredMembers.filter((usr) => {
				return !blockers.blocked.some((blocker) => {
					return usr.id === blocker.id;
				});
			});
			filter = filteredBlockers;
		} else {
			filter = filteredMembers;
		}
		client.emit('filter', filter);
		const search = await this.channelService.getSearchPreviews(
			channelData.email,
		);
		client.emit('update search', search);
		this.server.in(channelName).emit('update channel request');
	}

	@SubscribeMessage('get direct channel')
	async newDirectChannel(
		@MessageBody() channelData: CreateDirectChannel.Request,
		@ConnectedSocket() client: Socket,
	) {
		const channelId =
			await this.channelService.getDirectChannel(channelData);
		const preview = await this.channelService.getPreview(
			channelId,
			channelData.email,
		);
		const channelName =
			await this.channelService.getChannelNameById(channelId);
		await client.join(channelName);
		client.emit('get direct channel', channelId);
	}

	@SubscribeMessage('get messages')
	async getMessages(
		@MessageBody() channelId: number,
		@ConnectedSocket() client: Socket,
	) {
		const data = await this.channelService.getMessages(channelId, client.data.id);
		client.emit('get messages', data);
	}

	@SubscribeMessage('new message')
	async newMessage(
		@MessageBody() messageData: CreateMessage.Request,
		@ConnectedSocket() client: Socket,
	) {
		const message = await this.channelService.createMessage(messageData);
		if (message) {
			const channelName = await this.channelService.getChannelNameById(
					messageData.channelId,
			);
			this.server.in(channelName).emit('request messages');
			this.server.in(channelName).emit('request previews');
			this.server.in(channelName).emit('update channel request');
		} else
			client.emit(
				'exception',
				"you currently don't have the right to talk in this channel ",
			);
	}

	async broadcast(event: string, data: any, channelId: number) {
		const channelName =
			await this.channelService.getChannelNameById(channelId);
		this.server.in(channelName).emit(event, data);
	}

	async getRole(
		email: string,
		owners: MemberPreview.Response[],
		admins: MemberPreview.Response[],
		members: MemberPreview.Response[],
		inviteds: MemberPreview.Response[],
	) {
		let role = Role.default;
		if (inviteds && inviteds.length > 0) {
			const isInvited: number = inviteds.filter((invited) => {
				return invited.email === email;
			}).length;
			if (isInvited > 0) role = Role.invited;
		}
		if (members && members.length > 0) {
			const isMember: number = members.filter((member) => {
				return member.email === email;
			}).length;
			if (isMember > 0) role = Role.member;
		}
		if (admins && admins.length > 0) {
			const isAdmin: number = admins.filter((admin) => {
				return admin.email === email;
			}).length;
			if (isAdmin > 0) role = Role.admin;
		}
		if (owners && owners.length > 0) {
			const isOwner: number = owners.filter((owner) => {
				return owner.email === email;
			}).length;
			if (isOwner > 0) role = Role.owner;
		}
		return role;
	}

	@SubscribeMessage('read channel status')
	async handleFetchStatus(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket,
	) {
		const user = await this.userService.getUserByEmail(data.email);
		const owners = await this.channelService.getOwners(
			user.id,
			data.channelId,
		);
		client.emit('get owner', owners);
		const admins = await this.channelService.getAdmins(
			user.id,
			data.channelId,
		);
		client.emit('get admins', admins);
		const members = await this.channelService.getMembers(
			user.id,
			data.channelId,
		);
		client.emit('get members', members);
		const inviteds = await this.channelService.getInviteds(
			user.id,
			data.channelId,
		);
		client.emit('get inviteds', inviteds);
		const role = await this.getRole(
			data.email,
			owners,
			admins,
			members,
			inviteds,
		);
		client.emit('get role', role);
	}

	@SubscribeMessage('get search update')
	async handleSuggestUsers(
		@MessageBody() email: string,
		@ConnectedSocket() client: Socket,
	) {
		const search = await this.channelService.getSearchPreviews(email);
		client.emit('update search', search);
	}

	@SubscribeMessage('make admin')
	async makeAdmin(
		@MessageBody() channelData: { userId: number; channelId: number },
		@ConnectedSocket() client: Socket,
	) {
		const channel = await this.channelService.makeAdmin(
			channelData,
			client.data.id,
		);
		if (channel) {
			const members = await this.channelService.getMembers(
				client.data.id,
				channel.id,
			);
			client.emit('get members', members);
			this.server.in(channel.name).emit('update channel request');
		} else {
			client.emit('exception', 'Cannot make this user administrator');
		}
	}

	@SubscribeMessage('remove admin')
	async removeAdmin(
		@MessageBody() channelData: { userId: number; channelId: number },
		@ConnectedSocket() client: Socket,
	) {
		const channel = await this.channelService.removeAdmin(
			channelData,
			client.data.id,
		);
		if (channel) {
			const members = await this.channelService.getMembers(
				client.data.id,
				channel.id,
			);
			client.emit('get members', members);
			this.server.in(channel.name).emit('update channel request');
		} else {
			client.emit('exception', 'Cannot remove this administrator');
		}
	}

	@SubscribeMessage('block member')
	async blockMember(
		@MessageBody() channelData: { userId: number; channelId: number },
		@ConnectedSocket() client: Socket,
	) {
		const channel = await this.channelService.blockMember(
			channelData,
			client.data.id,
		);
		if (channel) {
			const members = await this.channelService.getMembers(
				client.data.id,
				channel.id,
			);
			client.emit('get members', members);
			this.server.in(channel.name).emit('update channel request');
		} else {
			client.emit('exception', 'Cannot block this member');
		}
	}

	@SubscribeMessage('unblock member')
	async unblockMember(
		@MessageBody() channelData: { userId: number; channelId: number },
		@ConnectedSocket() client: Socket,
	) {
		const channel = await this.channelService.unblockMember(
			channelData,
			client.data.id,
		);
		if (channel) {
			const members = await this.channelService.getMembers(
				client.data.id,
				channel.id,
			);
			client.emit('get members', members);
			this.server.in(channel.name).emit('update channel request');
		} else {
			client.emit('exception', 'Cannot unblock non-blocked member');
		}
	}

	@SubscribeMessage('kick member')
	async kickMember(
		@MessageBody() channelData: { userId: number; channelId: number },
		@ConnectedSocket() client: Socket,
	) {
		const channel = await this.channelService.kickMember(
			channelData,
			client.data.id,
		);
		if (channel) {
			const members = await this.channelService.getMembers(
				client.data.id,
				channel.id,
			);
			client.emit('get members', members);
			this.server.in(channel.name).emit('update channel request');
		} else {
			client.emit('exception', 'Cannot kick this member');
		}
	}

	@SubscribeMessage('mute member')
	async muteUser(
		@MessageBody()
		muteData: {
			finishAt: string;
			userId: number;
			channelId: number;
		},
		@ConnectedSocket() client: Socket,
	) {
		if (new Date(muteData.finishAt).getTime() < new Date(Date.now()).getTime()) {
			client.emit(
				'exception',
				`Cannot mute before ${new Date('now').toDateString()}`,
			);
		}

		const channel = await this.channelService.muteMember(
			muteData,
			client.data.id,
		);
		if (channel) {
			const members = await this.channelService.getMembers(
				client.data.id,
				channel.id,
			);
			client.emit('get members', members);
			this.server.in(channel.name).emit('update channel request');
		} else {
			client.emit('exception', 'Cannot mute this member');
		}
	}

	@SubscribeMessage('unmute member')
	async unmuteUser(
		@MessageBody()
			muteData: {
				userId: number;
				channelId: number;
			},
		@ConnectedSocket() client: Socket,
	) {

		const channel = await this.channelService.unmuteMember(
			muteData,
			client.data.id,
		);
		if (channel) {
			const members = await this.channelService.getMembers(
				client.data.id,
				channel.id,
			);
			client.emit('get members', members);
			this.server.in(channel.name).emit('update channel request');
		} else {
			client.emit('exception', 'Cannot unmute this member');
		}
	}

	@SubscribeMessage('update channel')
	async updateChannel(
		@MessageBody() channelData: UpdateChannel.Request,
		@ConnectedSocket() client: Socket,
	) {
		const channelName = await this.channelService.updateChannel(
			channelData,
			client.data.id,
		);
		if (channelName) {
			this.server.in(channelName).emit('update channel request');
		} else {
			client.emit('exception', 'Cannot update this channel');
		}
	}

	@SubscribeMessage('delete channel')
	async deleteChannel(
		@MessageBody() channelId: number,
		@ConnectedSocket() client: Socket,
	) {
		const channelName = await this.channelService.deleteChannel(
			channelId,
			client.data.id,
		);
		if (channelName) {
			this.server.in(channelName).emit('update channel request');
			this.server.in(channelName).socketsLeave(channelName);
		} else {
			client.emit('exception', 'Deleted');
		}
	}
}
