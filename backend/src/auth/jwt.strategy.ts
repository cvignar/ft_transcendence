import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
// import { extractTokenFromHeaders } from './extractTokens';
import { UserService } from '../user/user.service';
import { Request } from 'express';

export const JwtParams = {
	secret: process.env.JWT_SECRET,
	signOptions: { expiresIn: '1d' },
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(private userService: UserService) {
		super({
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromExtractors([
				JwtStrategy.extractJWT,
				ExtractJwt.fromAuthHeaderAsBearerToken(),
			]),
			secretOrKey: JwtParams.secret,
		});
	}

	async validate(payload: any) {
		const user = await this.userService.getUserById(payload.sub);
		if (!user) {
			throw new UnauthorizedException('Access denied');
		}
		if (payload?.only2FA == true) {
			throw new UnauthorizedException('2FA required');
		}
		return { name: payload.username, id: payload.sub };
	}

	private static extractJWT(req: Request) {
		if (req.cookies && req.cookies.accessToken) {
			return req.cookies.accessToken;
		} else {
			return undefined;
		}
	}
}
