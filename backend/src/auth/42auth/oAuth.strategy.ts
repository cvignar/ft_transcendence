import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { UserService } from '../../user/user.service';
import { Inject } from '@nestjs/common';
import { OAuthService } from './oAuth.service';

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
		const { fourtyTwoId, username, photos } = profile;
		
		const user42 = await await this.oAuthService.login({id42: profile.id});;

		done(null, user42); // we basically create id for user 
		return this.usersService.createFrom42(as_json)
	}
}