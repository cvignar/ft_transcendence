import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy, VerifyCallback } from 'passport-42';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service'
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

@Injectable()
export class Oauth42Strategy extends PassportStrategy(Strategy, 'intra42') {
	constructor(
		private authService: AuthService,
		private userService: UserService,
		private readonly configService: ConfigService,
	) {
		super({
			clientID: configService.get<String>("INTRA_UID"),
			clientSecret: configService.get<String>("INTRA_SECRET"),
			callbackURL: configService.get<String>("AUTH_CALLBACK_URL"),
		});
	}

	async validate(
		access_token: string,
		refreshToken: string,
		profile: Profile,
		done: VerifyCallback,
	): Promise<User | undefined> {
		// console.log(access_token);
		// console.log(refreshToken);
		// console.log(profile.username);
		// console.log(profile.id);
		// console.log(profile.emails[0].value);
		const user = await this.authService.validateIntraUser(
			profile.id,
			profile.username,
			profile.emails[0].value,
		);
		return user;
	}
}
