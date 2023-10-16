import {
	Body,
	Controller,
	Redirect,
	Post,
	HttpCode,
	HttpStatus,
	ParseIntPipe,
	UseGuards,
	Get,
	Request,
	Req,
	Res,
	BadRequestException,
	UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { User } from '@prisma/client';
import { Oauth42Guard } from './oauth42.guard';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt.guard';
import * as OTPAuth from "otpauth";

@WebSocketGateway()
export class AuthGateway {
	@WebSocketServer()
	server;
}

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
		private authGateway: AuthGateway,
		private jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	@Post('login')
	signIn(
		@Body()
		signInDto: {
			email: string;
			username: string;
			password: string;
		},
	) {
		return this.authService.signIn(
			signInDto.email,
			signInDto.username,
			signInDto.password,
		);
	}

	@Post('logout')
	logout(
		@Body('userId', ParseIntPipe) userId: number
	) {
		if (!userId) {
			throw new UnauthorizedException();
		}
		return this.userService.logout(userId);
	}

	@Get('intra42')
	@UseGuards(Oauth42Guard)
	auth42(): void {
		return;
	}

	@Get('callback')
	@UseGuards(Oauth42Guard)
	async callback(@Req() req: any, @Res({ passthrough: true }) res: Response) {
		const user: User = await this.userService.getUserById(req.user.id);
		if (!user) {
			res.redirect(`https://${process.env.HOST_NAME}:${process.env.HOST_PORT}/Auth`);
			throw new UnauthorizedException();
		}
		if (!user.twoFA) {
			const payload = { sub: user.id, username: user.username };
			const token = await this.jwtService.signAsync(payload);
			this.userService.updateJWTAccess(user.id, token);
			res.cookie('accessToken', token);
			res.cookie('userId', user.id);
			res.redirect(`https://${process.env.HOST_NAME}:${process.env.HOST_PORT}/Auth`);
		}
		else {
			res.cookie('userId', user.id);
			res.cookie('twoFA', true);
			res.redirect(`https://${process.env.HOST_NAME}:${process.env.HOST_PORT}/Auth/2FA`);
		}
	}

  @Post('2fa')
  async login2fa (@Req() req:any, @Res({passthrough: true}) res: Response, @Body() body: any)
  {
	const code2fa = body.code;
	let user_id: number | null = null;
	if (req.cookies && req.cookies.userId) {
		user_id = Number(req.cookies.userId);
	}
	else {
		console.log('somethings went wrong with 2fa')
		return ;
	}
	const user: User = await this.userService.getUserById(user_id);
	let access_token: string | null = null;
	if (user && user.username && user.twoFAsecret) {
		let totp = new OTPAuth.TOTP({
			issuer: user.username,
			label: "PingPong72",
			algorithm: "SHA512",
			digits: 6,
			period: 30,
			secret: user.twoFAsecret,
		});
		let valid_token = totp.generate();
		// console.log(totp.toString())
		// console.log('test_token totp: ', valid_token);
		if (valid_token === code2fa) {
			const payload = { sub: user.id, username: user.username };
			access_token = await this.jwtService.signAsync(payload);
			await this.userService.updateJWTAccess(user.id, access_token);

			res.cookie('accessToken', access_token);
			// console.log('return access_token: ', access_token);
		}
		else {
			// console.log('2fa is wrong')
		}
	}
	
  }

	@Get('intra42/return')
	@UseGuards(Oauth42Guard)
	@Redirect('/')
	oauth42Callback(@Req() req: any) {
		// console.log('RETURN VALUE: ', req.cookie);
		return; // await this.authService.validateIntraUser();
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
		return req.user;
	}
}
