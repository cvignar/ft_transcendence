import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController, AuthGateway } from './auth.controller';
import { AuthService } from './auth.service';
import { Oauth42Strategy } from './oauth42.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Module({
	imports: [
		UserModule,
		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1d' },
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, AuthGateway, Oauth42Strategy, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
