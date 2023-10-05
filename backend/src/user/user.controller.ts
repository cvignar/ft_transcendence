import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Req,
	UseGuards,
	UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { UserService } from './user.service';
import { CreateUser } from '../../../contracts/user.schema--';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Request } from 'express';
@Controller('user')
// @UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}
	@UsePipes(ZodValidationPipe)
	//@ApiTags('user')
	@Post('create')
	//@ApiOperation({ summary: 'Create user' })
	async createUser(
		@Body()
		userData: CreateUser.Request,
	): Promise<User> {
		return this.userService.createUser(userData);
	}

	@Get('getProfile')
	async getProfile(@Req() req: Request) {
		// const userId = req.cookies.userId;
		// console.log(userId, typeof userId);
		return await this.userService.getProfile(10);
	}

	@Post('updateProfile/:id')
	async updateProfile(
		@Param('id', ParseIntPipe) userId: number,
		@Body() userData: any,
	) {
		return await this.userService.updateUser(userId, userData);
	}

	@Get('enable2fa')
	async enable2fa (@Req() req: Request) {
		if (req.cookies && req.cookies.userId)
			return await this.userService.enable2fa(req.cookies.userId);
	}

	@Get('disable2fa')
	async disable2fa (@Req() req: Request) {
		if (req.cookies && req.cookies.userId)
			return await this.userService.disable2fa(req.cookies.userId);
	}
}
