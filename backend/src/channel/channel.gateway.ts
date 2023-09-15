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

@WebSocketGateway()
export class ChannelGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    //private channelService: ChannelService,
    private userService: UserService,
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    console.log(`client ${args} connected, socket: ${client.data}`);
  }
  //const channels = await this.channelService.getChannelsByUserId(id);
  //await client.join('all');
  //if (channels) {
  //  for (const channel of channels) {
  //    await client.join(channel);
  //  }
  //}

  async handleDisconnect(client: any) {
    console.log(`client disconnected: ${client}`);
  }
  @SubscribeMessage('hello')
  //handleGetChannels(@MessageBody('id') id: number): {}
  handleMessage(@MessageBody() data: string) {
    console.log(`recieved data: ${data}`);
    this.server.emit('message', 'hello!');
  }
  //@SubscribeMessage('get previews')
  //handleGetChannels(@MessageBody('id') id: number): {}
  //handleMessage(client: any, payload: any): string {
  //  return 'Hello world!';
  //}
}
