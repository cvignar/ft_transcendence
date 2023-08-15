import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';
import { ChannelService } from './channel.service';
import { PrismaService } from './prisma.service';
import { UserController } from './user.controller';
import { ChannelController } from './channel.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '../.env'],
    }),
  ],
  controllers: [AppController, UserController, ChannelController],
  providers: [AppService, PrismaService, UserService, ChannelService],
})
export class AppModule {}
