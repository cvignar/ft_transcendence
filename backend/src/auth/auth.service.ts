import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UserService,
		private jwtService: JwtService,
	) {}

	async signIn(email: string, username: string, pass: string): Promise<any> {
		let user = await this.usersService.getUserByEmail(email);
		if (!user) {
			const hash = await argon2.hash(pass);
			user = await this.usersService.createUser({
				email: email,
				username: username,
				hash: hash,
				id42: 42,
			});
		} else if (!(await argon2.verify(user.hash, pass))) {
			throw new UnauthorizedException();
		}
		const payload = { sub: user.id, username: user.username };
		return {
			access_token: await this.jwtService.signAsync(payload),
			id: user.id,
		};
	}
}
