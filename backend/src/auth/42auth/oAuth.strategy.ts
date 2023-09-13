import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { UserService } from '../../user/user.service';
import { Inject } from '@nestjs/common';
import { OAuthService } from './oAuth.service';
import { CreateUser42 } from 'contracts/user.schema';
import { User } from '@prisma/client';

export class FourtyTwoStrategy extends PassportStrategy(Strategy, '42') {
	constructor(@Inject(UserService) private readonly usersService: UserService, 
	@Inject(OAuthService) private readonly oAuthService: OAuthService) {
		super({
			clientID: process.env.FORTYTWO_CLIENT_ID,
			clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
			callbackURL: process.env.INTRA_REDIRECT_URI,
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any, done: Function)
	{
		const as_json = profile._json;
		
		const user42 = await this.oAuthService.login({id42: as_json['id']});

		// if (user42) {
		// 	return user42;
		// }

		done(null, user42); // we basically create id for user 
		return this.usersService.createFrom42(as_json)
	}
}