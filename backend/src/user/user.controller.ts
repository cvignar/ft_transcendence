import {
	Body,
	Controller,
	FileTypeValidator,
	Get,
	MaxFileSizeValidator,
	Param,
	ParseFilePipe,
	ParseIntPipe,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { UserService } from './user.service';
import { CreateUser } from '../../../contracts/user.schema--';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'
import * as fs from 'fs'
import * as path from 'path'

@Controller('user')
// @UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}
	// @UsePipes(ZodValidationPipe)
	//@ApiTags('user')
	@Post('create')
	//@ApiOperation({ summary: 'Create user' })
	async createUser(
		@Body()
		userData: CreateUser.Request,
	): Promise<User> {
		return this.userService.createUser(userData);
	}

	@Get('getProfile/:id')
	async getProfile(
		@Param('id', ParseIntPipe) id: number,
		@Req() req: Request,
	) {
		console.log(req.cookies);
		return await this.userService.getProfile(id);
	}

	@Post('updateProfile/:id')
	async updateProfile(
		@Param('id', ParseIntPipe) userId: number,
		@Body() userData: any,
		@Req() req: Request,
	) {
		console.log(req.cookies);
		return await this.userService.updateUser(userId, userData);
	}

	@Post('uploadAvatar/:id')
	@UseInterceptors(FileInterceptor('avatar'))
	async updateAvatar(
		@Param('id', ParseIntPipe) user_id: number,
		@Req() req: Request,
		@Res() res: Response,
		@Body() userdata: any,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }), //'.(png|jpeg|jpg)' -> when all 3 should be supported
					new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }), // should be enabled in productive system
				],
			}),
		)
		file: Express.Multer.File,
	) {
		// console.log(file);

		const extension = path.extname(file.originalname);
		const new_name = user_id + extension;

		// const file_extension = path.extname(file.originalname);
		const url_path = '/user/avatars/';
		const server_path = '/upload/';

		fs.writeFile(server_path + new_name, file.buffer, (err) => {
			if (err) {
				console.error(err);
			}
		});
		return url_path + new_name;
	}

	/**
	 * Return images from upload folder -> used for avatar images
	 * @param img_name
	 * @param req
	 * @param res
	 * @returns
	 */

	@Get('/avatars/:imgName')
	async getAvatar(@Param('imgName') img_name, @Req() req, @Res() res) {
		const imgPath = null;
		// console.log(`get ImagesFile: ${img_name}`);
		return res.sendFile(img_name, { root: '/upload/' });
	}

	@Get('enable2fa')
	async enable2fa(@Req() req: Request) {
		if (req.cookies && req.cookies.userId)
			return await this.userService.enable2fa(req.cookies.userId);
	}

	@Get('disable2fa')
	async disable2fa(@Req() req: Request) {
		if (req.cookies && req.cookies.userId)
			return await this.userService.disable2fa(req.cookies.userId);
	}
}
