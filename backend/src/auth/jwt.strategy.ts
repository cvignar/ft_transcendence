import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { Request } from 'express';
import { Socket } from 'socket.io';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(private userService: UserService) {
		super({
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromExtractors([
				JwtStrategy.extractJWT,
				JwtStrategy.socketJWT,
				ExtractJwt.fromAuthHeaderAsBearerToken(),
			]),
			secretOrKey: process.env.JWT_SECRET,
		});
	}

	async validate(payload: any) {
		const user = await this.userService.getUserById(payload.sub);
		if (!user) {
			// console.log('no user found');
			throw new UnauthorizedException('Access denied');
		}
		if (payload?.only2FA == true) {
			// console.log('2FA required');
			throw new UnauthorizedException('2FA required');
		}
		return { name: payload.username, id: payload.sub };
	}

	private static extractJWT(req: Request): string | null{
		if (req.cookies && req.cookies.accessToken) {
			return req.cookies.accessToken;
		} else {
			return undefined;
		}
	}

	private static socketJWT(socket: Socket) {
		if (
			socket &&
			socket.handshake &&
			socket.handshake.headers &&
			socket.handshake.headers.token
		) {
			return socket.handshake.headers.token;
		} else {
			return undefined;
		}
	}

}
