import { UseFilters, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
import { CreateChannel, UpdateChannel } from 'contracts/channel.schema';

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
  async channelSearch(
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
        channelData.channelId,
      );
      client.join(channelName);
      const user = await this.userService.getUserByEmail(channelData.email);
      const preview = await this.channelService.getPreviews(channelData.email);
      client.emit('update preview', preview);
      const members = await this.channelService.getMembers(
        user.id,
        channelData.channelId,
      );
      client.emit('get members', members);
    }
  }
}
