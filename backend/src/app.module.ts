import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { ChannelModule } from './channel/channel.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { AppGateway } from './app.gateway';

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
    AuthModule,
    //JwtModule.register({
    //  global: true,
    //  secret: jwtConstants.secret,
    //  signOptions: { expiresIn: '300m' },
    //}),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, AppGateway],
})
export class AppModule {}
