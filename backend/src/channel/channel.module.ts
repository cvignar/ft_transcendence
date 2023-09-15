import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { ChannelGateway } from './channel.gateway';

@Module({
  //   imports: [forwardRef(() => UserModule)],
  imports: [],
  controllers: [ChannelController],
  providers: [ChannelService, PrismaService, UserService, ChannelGateway],
  //   exports: [/*ChannelGateway, */ ChannelService],
})
export class ChannelModule {}
