import { Module, forwardRef } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from 'src/user/user.service';

@Module({
//   imports: [forwardRef(() => UserModule)],
	imports: [],
	controllers: [ChannelController],
	providers: [ChannelService, PrismaService, UserService /*, ChannelGateway*/],
//   exports: [/*ChannelGateway, */ ChannelService],
})
export class ChannelModule {}
