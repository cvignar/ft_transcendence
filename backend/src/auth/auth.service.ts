import { Injectable, UnauthorizedException, Req, Res } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
	) {}

	async signIn(email: string, username: string, pass: string): Promise<any> {
		let user = await this.userService.getUserByEmail(email);
		if (!user) {
			const hash = await argon2.hash(pass);
			user = await this.userService.createUser({
				email: email,
				username: username,
				hash: hash,
				id42: 42,
			});
		} else if (!(await argon2.verify(user.hash, pass))) {
			throw new UnauthorizedException('Wrong password');
		} else if (user.username !== username) {
			throw new UnauthorizedException('Wrong login');
		}
		const payload = { sub: user.id, username: user.username };
		const access_token = this.jwtService.sign(payload);
		return await this.userService.updateJWTAccess(user.id, access_token);
	}

	async validateIntraUser(
		id: number,
		username: string,
		email: string,
	): Promise<any> {
		const user = await this.userService.getUserByEmail(email);
		if (user) {
			const payload = { sub: user.id, username: user.username };
			const token = await this.jwtService.signAsync(payload);
			return this.userService.updateJWTAccess(user.id, token);
		} else {
			const user = await this.userService.createUser({
				username: username,
				hash: '',
				email: email,
				id42: Number(id),
			});
			const payload = { sub: user.id, username: user.username };
			const token = await this.jwtService.signAsync(payload);
			return await this.userService.updateJWTAccess(user.id, token);
		}
	}
}
