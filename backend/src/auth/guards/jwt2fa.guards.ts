// import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
// import { PassportStrategy } from "@nestjs/passport";
// import { Strategy, ExtractJwt } from 'passport-jwt';
// import { extractTokenFromHeaders } from '../strategy/extractTokens';
// import { UserService } from '../../user/user.service';

// export	const JwtParams = {
//     secret: process.env.JWT_SECRET, // Replace with your desired secret key
//     signOptions: { expiresIn: '1d' }, // Optionally, set token expiration
// };

// @Injectable()
// export class JwtTwoFaStrategy extends PassportStrategy(Strategy, 'jwt-two-fa') {
//     constructor(
//         private usersService: UserService
//     ) {
//         super({
// 			ignoreExpiration: false,
// 			jwtFromRequest: extractTokenFromHeaders,
// 			secretOrKey: JwtParams.secret, // Replace with your secret key
// 		});
//     }

//     async validate(payload: any) {
//         const user = await this.usersService.getUserById(payload.id);
//         if (!user) {
//             throw new UnauthorizedException('Access denied');
//         }
//         if (!user.twoFactorAuthSecret) {
//             throw new ConflictException('2FA not enabled');
//         }
//         return { name: payload.owner, id: payload.id};
//     }
// }