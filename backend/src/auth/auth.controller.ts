import {
	Body,
	Controller,
	Post,
	HttpCode,
	HttpStatus,
	UseGuards,
	Get,
	Request,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	//@HttpCode(HttpStatus.OK)
	@Post('login')
	signIn(
		@Body()
		signInDto: {
			email: string;
			username: string;
			password: string;
		},
	) {
		return this.authService.signIn(
			signInDto.email,
			signInDto.username,
			signInDto.password,
		);
	}
	@UseGuards(AuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
		return req.user;
	}
}
