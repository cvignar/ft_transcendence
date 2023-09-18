import { UseFilters, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
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
import { CreateMessage, MessagePreview } from 'contracts/Message.schema';
import { MemberPreview, Role } from 'contracts/user.schema';

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
    await client.join('all');
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
      client.emit('exception', 'wrong password');
    } else {
      const channelName = await this.channelService.getChannelNameById(
        channelData.id,
      );
      client.join(channelName);
      const user = await this.userService.getUserByEmail(channelData.email);
      const preview = await this.channelService.getPreviews(channelData.email);
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
    const previews = await this.channelService.getPreviews(channelData.email);
    client.emit('update preview', previews);
    const search = await this.channelService.getSearchPreviews(
      channelData.email,
    );
    client.emit('search update', search);
    client.emit('fetch owner', []);
    client.emit('fetch admins', []);
    client.emit('fetch members', []);
    client.emit('fetch inviteds', []);
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
    const preview = await this.channelService.getPreviews(channelData.email);
    client.emit('update preview', preview);
    const search = await this.channelService.getSearchPreviews(
      channelData.email,
    );
    client.emit('search update', search);
    client.emit('fetch owner', []);
    client.emit('fetch admins', []);
    client.emit('fetch members', []);
    client.emit('fetch inviteds', []);
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
    const admins = await this.channelService.getAdmins(user.id, channelData.id);
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
    client.emit('search update', search);
    this.server.in(channelName).emit('update channel request');
  }

  @SubscribeMessage('new direct channel')
  async newDirectChannel(
    @MessageBody() channelData: CreateDirectChannel.Request,
    @ConnectedSocket() client: Socket,
  ) {
    const channelId =
      await this.channelService.createDirectChannel(channelData);
    const preview = await this.channelService.getPreview(
      channelId,
      channelData.email,
    );
    const channelName = await this.channelService.getChannelNameById(channelId);
    await client.join(channelName);
    client.emit('add preview', preview);
    return channelId;
  }

  @SubscribeMessage('get messages')
  async getMessages(
    @MessageBody() channelId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const data = await this.channelService.getMessages(channelId);
    client.emit('get messages', data);
  }

  @SubscribeMessage('new message')
  async newMessage(
    @MessageBody() messageData: CreateMessage.Request,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.channelService.createMessage(messageData);
    if (message) {
      this.broadcast('broadcast', message, messageData.channelId);
      const previews = await this.channelService.getPreviews(messageData.email);
      client.emit('update preview', previews);
      const channelName = await this.channelService.getChannelNameById(
        messageData.channelId,
      );
      this.server.in(channelName).emit('update channel request');
    } else
      client.emit(
        'exception',
        "you currently don't have the right to talk in this channel",
      );
  }

  async broadcast(
    event: string,
    message: MessagePreview.Response,
    channelId: number,
  ) {
    const channelName = await this.channelService.getChannelNameById(channelId);
    this.server.in(channelName).emit(event, message);
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

  @SubscribeMessage('read room status')
  async handleFetchStatus(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.userService.getUserByEmail(data.email);
    const owners = await this.channelService.getOwners(user.id, data.channelId);
    client.emit('fetch owner', owners);
    const admins = await this.channelService.getAdmins(user.id, data.channelId);
    client.emit('fetch admins', admins);
    const members = await this.channelService.getMembers(
      user.id,
      data.channelId,
    );
    client.emit('fetch members', members);
    const inviteds = await this.channelService.getInviteds(
      user.id,
      data.channelId,
    );
    client.emit('fetch inviteds', inviteds);
    const role = await this.getRole(
      data.email,
      owners,
      admins,
      members,
      inviteds,
    );
    client.emit('fetch role', role);
  }

  @SubscribeMessage('get search update')
  async handleSuggestUsers(
    @MessageBody() email: string,
    @ConnectedSocket() client: Socket,
  ) {
    const search = await this.channelService.getSearchPreviews(email);
    client.emit('search update', search);
  }

  //@SubscribeMessage('get user tags')
  //async handleUserTags(
  //  @MessageBody() email: string,
  //  @ConnectedSocket() client: Socket,
  //) {
  //  const userTags = await this.channelService.get__userTags(email);
  //  client.emit('user tags', userTags);
  //}

  //@SubscribeMessage('get invitation tags')
  //async handleInvitationTags(
  //  @MessageBody() channelId: number,
  //  @ConnectedSocket() client: Socket,
  //) {
  //  const invitationTags =
  //    await this.channelService.get__invitationTags(channelId);
  //  client.emit('invitation tags', invitationTags);
  //}

  @SubscribeMessage('delete msg')
  async handleDeleteMsg(
    @MessageBody() messageData: MessagePreview.Response,
    @ConnectedSocket() client: Socket,
  ) {
    const channelName = await this.channelService.getChannelNameById(
      messageData.channelId,
    );
    await this.channelService.deleteMessage(messageData);
    const fetch = await this.channelService.getMessages(messageData.channelId);
    client.emit('fetch msgs', fetch);
    const previews = await this.channelService.getPreviews(messageData.email);
    client.emit('update preview', previews);
    this.server.in(channelName).emit('update channel request');
  }

  //@SubscribeMessage('be admin')
  //async handleBeAdmin(
  //  @MessageBody() channelData: UpdateChannel.Request,
  //  @ConnectedSocket() client: Socket,
  //) {
  //  const channelName = await this.channelService.getChannelNameById(
  //    channelData.id,
  //  );
  //  await this.channelService.be__admin(channelData);
  //  const id = await this.channelService.get__id__ByEmail(channelData.email);
  //  const admins = await this.channelService.fetch__admins(id, channelData.id);
  //  client.emit('fetch admins', admins);
  //  const members = await this.channelService.fetch__members(
  //    id,
  //    channelData.id,
  //  );
  //  client.emit('fetch members', members);
  //  this.server.in(channelName).emit('update channel request');
  //}

  //@SubscribeMessage('not admin')
  //async handleNotAdmin(
  //  @MessageBody() data: updateChannel,
  //  @ConnectedSocket() client: Socket,
  //) {
  //  const cName = await this.chatservice.get__Cname__ByCId(data.channelId);
  //  await this.chatservice.not__admin(data);
  //  const id = await this.chatservice.get__id__ByEmail(data.email);
  //  const admins = await this.chatservice.fetch__admins(id, data.channelId);
  //  client.emit('fetch admins', admins);
  //  const members = await this.chatservice.fetch__members(id, data.channelId);
  //  client.emit('fetch members', members);
  //  this.updateChannelRequest('update channel request', cName);
  //}

  //@SubscribeMessage('get setting')
  //async handleGetSetting(
  //  @MessageBody() channelId: number,
  //  @ConnectedSocket() client: Socket,
  //) {
  //  const info = await this.chatservice.get__setting(channelId);
  //  client.emit('setting info', info);
  //}

  //@SubscribeMessage('update setting')
  //async handleUpdateSetting(
  //  @MessageBody() data: updateChannel,
  //  @ConnectedSocket() client: Socket,
  //) {
  //  const cName = await this.chatservice.get__Cname__ByCId(data.channelId);
  //  await this.chatservice.update__setting(data);
  //  const info = await this.chatservice.get__setting(data.channelId);
  //  client.emit('setting info', info);
  //  this.updateChannelRequest('update channel request', cName);
  //}

  //@SubscribeMessage('mute user')
  //async handleMuteUser(@MessageBody() data: mute) {
  //  await this.chatservice.new__mute(data);
  //}

  //@SubscribeMessage('add friend')
  //async addFriend(
  //  @MessageBody() data: updateUser,
  //  // @ConnectedSocket() client: Socket,
  //) {
  //  const id = await this.chatservice.get__id__ByEmail(data.selfEmail);
  //  await this.userService.addFriend(id, data.otherId);
  //}

  //@SubscribeMessage('block user')
  //async blockUser(
  //  @MessageBody() data: updateUser,
  //  @ConnectedSocket() client: Socket,
  //) {
  //  const id = await this.chatservice.get__id__ByEmail(data.selfEmail);
  //  await this.userService.blockUser(id, data.otherId);
  //  client.emit('update channel request');
  //}

  //@SubscribeMessage('unblock user')
  //async unblockUser(
  //  @MessageBody() data: updateUser,
  //  @ConnectedSocket() client: Socket,
  //) {
  //  const id = await this.chatservice.get__id__ByEmail(data.selfEmail);
  //  await this.userService.unblockUser(id, data.otherId);
  //  client.emit('update channel request');
  //}
}
