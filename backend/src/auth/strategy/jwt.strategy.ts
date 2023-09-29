import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
// import { extractTokenFromHeaders } from './extractTokens';
import { UserService } from '../../user/user.service';

export	const JwtParams = {
		secret: process.env.JWT_SECRET,
		signOptions: { expiresIn: '1d' },
	};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private userService: UserService,
	) {
		super({
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: JwtParams.secret,
		});
	}
	
	async validate(payload: any) {
		const user = await this.userService.getUserById(payload.id);
		if (!user) {
			throw new UnauthorizedException('Access denied');
		}
		if (payload?.only2FA == true) {
			throw new UnauthorizedException('2FA required');
		}
		return { name: payload.owner, id: payload.id};
	}
}