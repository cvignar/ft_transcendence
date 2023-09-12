import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { ChannelModule } from './channel/channel.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      // set path to .env file
      envFilePath: '../.env',
      // global import
      isGlobal: true,
      // expand variables
      expandVariables: true,
    }),
    ChannelModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
