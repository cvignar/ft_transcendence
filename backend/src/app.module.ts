import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { ChannelModule } from './channel/channel.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AppGateway } from './app.gateway';
import { GameModule } from './game/game.module';
import { GameService } from './game/game.service';
import { JwtAuthGuard } from './auth/jwt.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
	imports: [
		UserModule,
		ConfigModule.forRoot({
			envFilePath: '../.env',
			isGlobal: true,
			expandVariables: true,
		}),
		ChannelModule,
		AuthModule,
		GameModule,
	],
	controllers: [AppController],
	providers: [AppService, PrismaService, AppGateway, GameService, JwtAuthGuard],
})
export class AppModule {}
