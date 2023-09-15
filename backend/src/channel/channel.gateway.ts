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
    await client.join('default_all');
    if (channels)
      for (const channel of channels) {
        await client.join(channel);
      }
  }

  //@SubscribeMessage('get preview')
  //async getPreview(@MessageBody() email: string) {
  //  const data = await this.channelService;
  //}
}
