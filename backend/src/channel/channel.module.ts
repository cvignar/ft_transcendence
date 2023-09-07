import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
	imports: [],
	controllers: [ChannelController],
	providers: [ChannelService, PrismaService],
})
export class ChannelModule {}
