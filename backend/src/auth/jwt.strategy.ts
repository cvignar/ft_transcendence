import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { Request } from 'express';
import { jwtConstants } from './constants';

export const JwtParams = {
	secret: jwtConstants.secret,
	signOptions: { expiresIn: '1d' },
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(private userService: UserService) {
		super({
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromExtractors([
				JwtStrategy.extractJWTFromCookie,
				ExtractJwt.fromAuthHeaderAsBearerToken(),
			]),
			secretOrKey: JwtParams.secret,
		});
	}

	async validate(payload: any) {
		const user = await this.userService.getUserById(payload.sub);
		if (!user) {
			console.log('no user found');
			throw new UnauthorizedException('Access denied');
		}
		if (payload?.only2FA == true) {
			console.log('2FA required');
			throw new UnauthorizedException('2FA required');
		}
		return { name: payload.username, id: payload.sub };
	}

	private static extractJWTFromCookie(req: Request): string | null{
		if (req.cookies && req.cookies.accessToken) {
			return req.cookies.accessToken;
		}
		console.log('accessToken missing');
		return null;
	}
}
