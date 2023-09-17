import { JwtService } from '@nestjs/jwt';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import {
  CreateChannel,
  DirectChannel,
  //CreateDirectChannel,
  UpdateChannel,
} from 'contracts/channel.schema';
import { Status } from 'contracts/user.schema';
import { Server, Socket } from 'socket.io';
import { jwtConstants } from './auth/constants';
import { ChannelGateway } from './channel/channel.gateway';
import { ChannelService } from './channel/channel.service';
import { UserService } from './user/user.service';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly channelGateway: ChannelGateway,
    private readonly channelService: ChannelService,
  ) {}

  userStatusMap = new Map<number, Status>();
  clientSocket = new Map<number, Socket>();

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      client.setMaxListeners(20); //FIXME!!!!
      const UserId: number = this.jwtService.verify(
        String(client.handshake.headers.token),
        { secret: jwtConstants.secret },
      ).sub;
      const user = this.userService.getUserById(UserId);
      client.data.id = UserId;
      if (!user) throw new WsException('Invalid token.');

      //setting status as online
      this.userStatusMap.set(client.data.id, Status.online);
      const serializedMap = [...this.userStatusMap.entries()];
      this.server.emit('update-status', serializedMap);
      //add to clientSocket
      this.clientSocket.set(UserId, client);
      console.log('connect userId', UserId, client.id);
      await this.channelGateway.handleJoinSocket(UserId, client);
    } catch (e) {
      return false;
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.id != undefined) {
      this.userStatusMap.set(client.data.id, Status.offline);
      const serializedMap = [...this.userStatusMap.entries()];
      client.emit('update-status', serializedMap);
      this.clientSocket.delete(client.data.id);
    }
    //if (IN A GAME) //FIXME!!!
    client.removeAllListeners();
  }

  @SubscribeMessage('get new channel')
  async getNewChannel(@MessageBody() channelData: CreateChannel.Request) {
    channelData.members.map(async (member) => {
      if (this.clientSocket.has(member.id)) {
        const client = this.clientSocket.get(member.id);
        client.join(channelData.name);
        client.emit('update channel request');
      }
    });
  }

  @SubscribeMessage('get new direct messages')
  async getNewDirectMessages(
    @MessageBody() channelData: DirectChannel.Request,
  ) {
    const channelName = await this.channelService.getChannelNameById(
      channelData.channelId,
    );
    if (this.clientSocket.has(channelData.userId)) {
      const client = await this.clientSocket.get(channelData.userId);
      client.join(channelName);
      client.emit('update channel request');
    }
  }

  @SubscribeMessage('get new invite')
  async getNewInvite(@MessageBody() channelData: UpdateChannel.Request) {
    if (this.clientSocket.has(channelData.memberId)) {
      const client = this.clientSocket.get(channelData.memberId);
      const channelName = await this.channelService.getChannelNameById(
        channelData.id,
      );
      client.join(channelName);
      client.emit('update channel request');
    }
  }
}
